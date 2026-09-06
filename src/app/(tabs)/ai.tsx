import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FadeInView, PressScale } from '@/components/ui/Anim';
import { sendAIMessage } from '@/services/api/ai';
import { colors, radii, shadows, spacing, touchTarget } from '@/theme';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  status?: 'sent' | 'error';
  retryMessage?: string;
};

const SUGGESTIONS: string[] = [
  'How much did I spend last month?',
  'Which milk do I consume the most?',
  'Am I spending more than usual?',
  'What was my most expensive month?',
  'How much milk did I consume this month?',
  'Show me my milk spending trend.',
];

function makeId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function AIScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const canSend = input.trim().length > 0 && !sending;

  const scrollToEnd = useCallback(() => {
    // slight delay to let layout settle after new message
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages, scrollToEnd, sending]);

  const handleSend = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || sending) return;

      const userMsg: ChatMessage = { id: makeId(), role: 'user', content: trimmed, createdAt: Date.now(), status: 'sent' };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setSending(true);

      try {
        const res = await sendAIMessage(trimmed);
        const assistantMsg: ChatMessage = {
          id: makeId(),
          role: 'assistant',
          content: res.answer,
          createdAt: Date.now(),
          status: 'sent',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'I could not reach MilkEdin AI right now.';
        const errorMsg: ChatMessage = {
          id: makeId(),
          role: 'assistant',
          content: message,
          createdAt: Date.now(),
          status: 'error',
          retryMessage: trimmed,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setSending(false);
      }
    },
    [sending],
  );

  const handleRetry = useCallback(
    (msg: ChatMessage) => {
      if (!msg.retryMessage || sending) return;
      // remove the error bubble, then re-send
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      void handleSend(msg.retryMessage);
    },
    [handleSend, sending],
  );

  const submitFromComposer = useCallback(() => {
    void handleSend(input);
  }, [handleSend, input]);

  return (
    <Screen title="MilkEdin AI" subtitle="Your personal milk assistant" scroll={false} maxWidth="narrow">
      <View style={styles.wrapper}>
        {messages.length > 0 ? (
          <View style={styles.clearBar}>
            <Text variant="small" color={colors.textMuted}>
              {messages.length} message{messages.length > 1 ? 's' : ''}
            </Text>
            <PressScale onPress={() => setShowClearConfirm(true)} accessibilityLabel="Clear chat" scale={0.97} disabled={sending}>
              <View style={[styles.clearButton, sending && styles.clearButtonDisabled]}>
                <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                <Text variant="small" color={colors.textMuted}>
                  Clear chat
                </Text>
              </View>
            </PressScale>
          </View>
        ) : null}
        {messages.length === 0 ? (
          <EmptyState onSelect={(q) => void handleSend(q)} />
        ) : (
          <>
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              accessibilityLabel="Chat conversation"
              onContentSizeChange={scrollToEnd}
              onLayout={scrollToEnd}
              renderItem={({ item }) => (
                <MessageBubble message={item} onRetry={() => handleRetry(item)} />
              )}
              ListFooterComponent={
                sending ? (
                  <View style={styles.thinkingRow} accessibilityLabel="AI is thinking">
                    <View style={styles.thinkingBubble}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text variant="small" color={colors.textMuted}>
                        AI is thinking…
                      </Text>
                    </View>
                  </View>
                ) : null
              }
            />

            {/* Compact suggestion strip after conversation started */}
            <View style={styles.compactSuggestionsWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.compactSuggestionsContent}
                keyboardShouldPersistTaps="handled">
                {SUGGESTIONS.slice(0, 4).map((q) => (
                  <PressScale
                    key={q}
                    onPress={() => void handleSend(q)}
                    accessibilityLabel={`Ask: ${q}`}
                    scale={0.97}>
                    <View style={styles.compactChip}>
                      <Text variant="small" color={colors.primary}>
                        {q}
                      </Text>
                    </View>
                  </PressScale>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        <View style={styles.composerRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask MilkEdin AI…"
            placeholderTextColor={colors.textSoft}
            style={styles.input}
            accessibilityLabel="Ask MilkEdin AI"
            returnKeyType="send"
            onSubmitEditing={submitFromComposer}
            editable={!sending}
            multiline
            blurOnSubmit={false}
            selectionColor={colors.primary}
            // Web: Enter to send (without Shift)
            onKeyPress={(e: unknown) => {
              const event = e as { nativeEvent?: { key?: string; shiftKey?: boolean } };
              if (Platform.OS === 'web' && event.nativeEvent?.key === 'Enter' && !event.nativeEvent?.shiftKey) {
                const native = event.nativeEvent as unknown as { preventDefault?: () => void };
                native.preventDefault?.();
                submitFromComposer();
              }
            }}
          />
          <Pressable
            onPress={submitFromComposer}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend }}
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: canSend ? colors.primary : colors.surfaceBorder, opacity: pressed && canSend ? 0.9 : 1 },
            ]}>
            <Ionicons name="arrow-up" size={22} color={canSend ? colors.onPrimary : colors.textSoft} />
          </Pressable>
        </View>
      </View>

      <ConfirmDialog
        visible={showClearConfirm}
        title="Clear chat?"
        message="This will remove all messages in this chat. This cannot be undone."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setShowClearConfirm(false);
          setMessages([]);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </Screen>
  );
}

function MessageBubble({ message, onRetry }: { message: ChatMessage; onRetry: () => void }) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  return (
    <FadeInView duration={260} y={8} style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : isError ? styles.errorBubble : styles.assistantBubble,
          isUser ? shadows.sm : shadows.md,
        ]}>
        {isUser ? (
          <Text variant="body" color={colors.onPrimary} style={styles.bubbleText}>
            {message.content}
          </Text>
        ) : (
          <FormattedAssistantText content={message.content} isError={isError} />
        )}
        {isError ? (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry message"
            style={({ pressed }) => [styles.retryButton, { opacity: pressed ? 0.86 : 1 }]}>
            <Text variant="small" color={colors.onPrimary} center>
              Try again
            </Text>
          </Pressable>
        ) : null}
      </View>
    </FadeInView>
  );
}

function FormattedAssistantText({ content, isError }: { content: string; isError: boolean }) {
  const baseColor = isError ? colors.text : colors.text;
  // 1) Strip markdown **bold** markers but keep bold styling
  // 2) Auto-highlight key numbers (₹ amounts, litres) for a modern professional look
  const parts: Array<{ text: string; bold: boolean }> = [];
  const boldRe = /\*\*(.+?)\*\*/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = boldRe.exec(content)) !== null) {
    if (m.index > lastIdx) parts.push({ text: content.slice(lastIdx, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < content.length) parts.push({ text: content.slice(lastIdx), bold: false });
  if (parts.length === 0) parts.push({ text: content, bold: false });

  // Further split plain parts to auto-bold currency / litre quantities
  const currencyRe = /(₹\s?[\d,]+(?:\.\d+)?|\d+(?:\.\d+)?\s*litres?)/gi;
  const expanded: Array<{ text: string; bold: boolean }> = [];
  for (const p of parts) {
    if (p.bold) {
      expanded.push(p);
      continue;
    }
    let last = 0;
    let cm: RegExpExecArray | null;
    // reset lastIndex for global regex per segment
    currencyRe.lastIndex = 0;
    const seg = p.text;
    while ((cm = currencyRe.exec(seg)) !== null) {
      if (cm.index > last) expanded.push({ text: seg.slice(last, cm.index), bold: false });
      expanded.push({ text: cm[0], bold: true });
      last = cm.index + cm[0].length;
    }
    if (last < seg.length) expanded.push({ text: seg.slice(last), bold: false });
  }

  // Clean stray single * or _ that sometimes leak from markdown
  const clean = (s: string): string => s.replace(/(^|\n)\s*[\*\-]\s+/g, '$1• ').replace(/__|\*|_`/g, '');

  return (
    <Text variant="body" color={baseColor} style={styles.bubbleText}>
      {expanded.map((p, i) => {
        const text = i === 0 || expanded[i - 1].text.endsWith('\n') ? clean(p.text) : p.text;
        if (!text) return null;
        if (p.bold) {
          return (
            <Text key={`${i}-${text.slice(0, 8)}`} style={styles.assistantBold}>
              {text}
            </Text>
          );
        }
        return <Text key={`${i}-${text.slice(0, 8)}`}>{text}</Text>;
      })}
    </Text>
  );
}

function EmptyState({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <ScrollView
      contentContainerStyle={styles.emptyContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.emptyIconWrap}>
        <Ionicons name="sparkles" size={40} color={colors.primary} />
      </View>
      <Text variant="sectionTitle" center>
        MilkEdin AI
      </Text>
      <Text variant="body" color={colors.textMuted} center style={styles.emptySubtitle}>
        Ask about your milk consumption, spending, categories, and trends.
      </Text>

      <Card style={styles.emptyHintCard} variant="warm">
        <View style={styles.emptyHintRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} />
          <Text variant="small" color={colors.textMuted} style={styles.emptyHintText}>
            Grounded in your private MilkEdin data · Powered by Gemini through your backend
          </Text>
        </View>
      </Card>

      <Text variant="bodyStrong" center style={styles.tryLabel}>
        Try asking
      </Text>
      <View style={styles.suggestionGrid}>
        {SUGGESTIONS.map((q) => (
          <PressScale key={q} onPress={() => onSelect(q)} accessibilityLabel={`Ask: ${q}`} scale={0.98}>
            <View style={styles.suggestionChip}>
              <Text variant="caption" color={colors.primary} center>
                {q}
              </Text>
            </View>
          </PressScale>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    gap: spacing.md,
  },
  clearBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  bubbleRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bubbleText: {
    // ensure selectable on web
    lineHeight: 24,
  },
  assistantBold: {
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.1,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.sm,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderBottomLeftRadius: radii.sm,
  },
  errorBubble: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#F0C4C0',
    borderBottomLeftRadius: radii.sm,
  },
  retryButton: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
  },
  thinkingRow: {
    paddingHorizontal: spacing.xs,
    alignItems: 'flex-start',
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  compactSuggestionsWrap: {
    marginHorizontal: -spacing.xl,
    paddingLeft: spacing.xl,
  },
  compactSuggestionsContent: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
    paddingVertical: spacing.xs,
  },
  compactChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxWidth: 260,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.md,
  },
  input: {
    flex: 1,
    minHeight: touchTarget.minHeight,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    textAlignVertical: Platform.OS === 'android' ? 'top' : 'center',
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Empty state
  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    maxWidth: 320,
  },
  emptyHintCard: {
    padding: spacing.md,
    alignSelf: 'stretch',
    maxWidth: 420,
  },
  emptyHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyHintText: {
    flex: 1,
  },
  tryLabel: {
    marginTop: spacing.lg,
  },
  suggestionGrid: {
    gap: spacing.sm,
    alignSelf: 'stretch',
    maxWidth: 420,
    width: '100%',
    // @ts-ignore web grid for desktop
    ...(Platform.OS === 'web'
      ? {
          flexDirection: 'row',
          flexWrap: 'wrap',
        }
      : {}),
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    // subtle warm highlight on press handled by PressScale opacity
    ...shadows.sm,
  },
});
