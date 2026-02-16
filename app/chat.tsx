import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import Avatar from '@/components/Avatar';
import { Message } from '@/lib/types';
import { CURRENT_USER_ID } from '@/lib/mock-data';

function timeFormat(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View style={[styles.bubbleContainer, isOwn && styles.bubbleContainerOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{message.content}</Text>
        <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>{timeFormat(message.timestamp)}</Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { matchId, momId } = useLocalSearchParams<{ matchId: string; momId: string }>();
  const { messages, sendMessage, getMomById } = useApp();
  const [inputText, setInputText] = useState('');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const mom = getMomById(momId || '');
  const chatMessages = messages[matchId || ''] || [];
  const sortedMessages = [...chatMessages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSend = () => {
    if (!inputText.trim() || !matchId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(matchId, inputText.trim());
    setInputText('');
  };

  if (!mom) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <Text>Chat not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Avatar name={mom.name} size={36} verified={mom.verified} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{mom.name}</Text>
          <Text style={styles.headerStatus}>
            {mom.hangNow ? 'Available now' : mom.lastActive}
          </Text>
        </View>
      </View>

      <FlatList
        data={sortedMessages}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.senderId === CURRENT_USER_ID} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 8) }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={({ pressed }) => [
              styles.sendButton,
              !inputText.trim() && { opacity: 0.4 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.accent,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bubbleContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  bubbleContainerOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleOther: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 21,
  },
  bubbleTextOwn: {
    color: Colors.white,
  },
  bubbleTime: {
    fontSize: 10,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    backgroundColor: Colors.white,
    paddingTop: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
});
