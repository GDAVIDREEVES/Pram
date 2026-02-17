import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform,
  KeyboardAvoidingView, Modal, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { fetch } from 'expo/fetch';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import Avatar from '@/components/Avatar';
import { Message, MeetupAttachment } from '@/lib/types';
import { CURRENT_USER_ID, locations } from '@/lib/mock-data';
import { BABY_EMOJI_CATEGORIES } from '@/lib/baby-emojis';
import { getApiUrl } from '@/lib/query-client';

const PANEL_HEIGHT = 300;

interface GifItem {
  id: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

function timeFormat(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMeetupDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getLocationIcon(locId: string): string {
  const loc = locations.find(l => l.id === locId);
  if (!loc) return 'location';
  switch (loc.type) {
    case 'cafe': return 'cafe';
    case 'park': return 'leaf';
    case 'playground': return 'happy';
    case 'restaurant': return 'restaurant';
    case 'library': return 'book';
    default: return 'location';
  }
}

function MeetupBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const meetup = message.meetup!;
  return (
    <View style={[styles.bubbleContainer, isOwn && styles.bubbleContainerOwn]}>
      <View style={[styles.meetupCard, isOwn ? styles.meetupCardOwn : styles.meetupCardOther]}>
        <View style={styles.meetupHeader}>
          <View style={[styles.meetupIconWrap, isOwn && styles.meetupIconWrapOwn]}>
            <Ionicons name={getLocationIcon(meetup.locationId) as any} size={18} color={isOwn ? Colors.white : Colors.primary} />
          </View>
          <Text style={[styles.meetupLabel, isOwn && styles.meetupLabelOwn]}>Meetup Invite</Text>
        </View>
        <Text style={[styles.meetupLocation, isOwn && styles.meetupLocationOwn]}>{meetup.locationName}</Text>
        <View style={styles.meetupDetailRow}>
          <Ionicons name="calendar-outline" size={14} color={isOwn ? 'rgba(255,255,255,0.8)' : Colors.textSecondary} />
          <Text style={[styles.meetupDetailText, isOwn && styles.meetupDetailTextOwn]}>{formatMeetupDate(meetup.date)}</Text>
          <Ionicons name="time-outline" size={14} color={isOwn ? 'rgba(255,255,255,0.8)' : Colors.textSecondary} style={{ marginLeft: 12 }} />
          <Text style={[styles.meetupDetailText, isOwn && styles.meetupDetailTextOwn]}>{meetup.time}</Text>
        </View>
        {meetup.note ? (
          <Text style={[styles.meetupNote, isOwn && styles.meetupNoteOwn]}>"{meetup.note}"</Text>
        ) : null}
        <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn, { marginTop: 8 }]}>{timeFormat(message.timestamp)}</Text>
      </View>
    </View>
  );
}

function GifBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View style={[styles.bubbleContainer, isOwn && styles.bubbleContainerOwn]}>
      <View style={styles.gifBubbleWrap}>
        <Image
          source={{ uri: message.gifUrl }}
          style={styles.gifBubbleImage}
          resizeMode="cover"
        />
        <Text style={[styles.bubbleTime, { color: Colors.textTertiary, marginTop: 4 }]}>{timeFormat(message.timestamp)}</Text>
      </View>
    </View>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  if (message.meetup) {
    return <MeetupBubble message={message} isOwn={isOwn} />;
  }
  if (message.gifUrl) {
    return <GifBubble message={message} isOwn={isOwn} />;
  }
  return (
    <View style={[styles.bubbleContainer, isOwn && styles.bubbleContainerOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{message.content}</Text>
        <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>{timeFormat(message.timestamp)}</Text>
      </View>
    </View>
  );
}

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM',
];

function getNextDays(count: number): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split('T')[0];
    let label: string;
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    days.push({ label, value });
  }
  return days;
}

function EmojiPanel({ onSelectEmoji }: { onSelectEmoji: (emoji: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const category = BABY_EMOJI_CATEGORIES[selectedCategory];

  return (
    <View style={styles.emojiPanel}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emojiCategoryBar}
      >
        {BABY_EMOJI_CATEGORIES.map((cat, idx) => (
          <Pressable
            key={cat.name}
            onPress={() => setSelectedCategory(idx)}
            style={[
              styles.emojiCategoryTab,
              selectedCategory === idx && styles.emojiCategoryTabActive,
            ]}
          >
            <Text style={styles.emojiCategoryIcon}>{cat.icon}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={category.emojis}
        numColumns={6}
        keyExtractor={(item, index) => `${category.name}_${index}`}
        renderItem={({ item }) => (
          <Pressable
            style={styles.emojiItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectEmoji(item);
            }}
          >
            <Text style={styles.emojiText}>{item}</Text>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      />
    </View>
  );
}

function GifPanel({ matchId, onSend }: { matchId: string; onSend: () => void }) {
  const { sendGifMessage } = useApp();
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = useCallback(async (query?: string) => {
    setLoading(true);
    setError('');
    try {
      const baseUrl = getApiUrl();
      const url = query
        ? `${baseUrl}api/gifs/search?q=${encodeURIComponent(query)}`
        : `${baseUrl}api/gifs/trending`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load GIFs');
      const data = await res.json();
      setGifs(data.gifs || []);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifs();
  }, [fetchGifs]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim()) {
        fetchGifs(text.trim());
      } else {
        fetchGifs();
      }
    }, 300);
  };

  const handleSelectGif = (gif: GifItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendGifMessage(matchId, gif.url);
    onSend();
  };

  return (
    <View style={styles.gifPanel}>
      <View style={styles.gifSearchBar}>
        <Ionicons name="search" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.gifSearchInput}
          placeholder="Search GIFs..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>
      {loading ? (
        <View style={styles.gifCenterState}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.gifCenterState}>
          <Text style={styles.gifErrorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={gifs}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.gifItemWrap}
              onPress={() => handleSelectGif(item)}
            >
              <Image
                source={{ uri: item.preview || item.url }}
                style={styles.gifItemImage}
                resizeMode="cover"
              />
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 4 }}
          columnWrapperStyle={{ gap: 4 }}
          ListEmptyComponent={
            <View style={styles.gifCenterState}>
              <Text style={styles.gifErrorText}>No GIFs found</Text>
            </View>
          }
          ListFooterComponent={
            gifs.length > 0 ? (
              <Text style={styles.giphyAttribution}>Powered by GIPHY</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { matchId, momId } = useLocalSearchParams<{ matchId: string; momId: string }>();
  const { messages, sendMessage, sendMeetupMessage, getMomById } = useApp();
  const [inputText, setInputText] = useState('');
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [meetupStep, setMeetupStep] = useState<'location' | 'details'>('location');
  const [selectedLocation, setSelectedLocation] = useState<typeof locations[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetupNote, setMeetupNote] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [panelTab, setPanelTab] = useState<'emojis' | 'gifs'>('emojis');


  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const days = getNextDays(14);

  const mom = getMomById(momId || '');
  const chatMessages = messages[matchId || ''] || [];
  const sortedMessages = [...chatMessages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLocations = locations.filter(loc =>
    !locationSearch || loc.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const togglePanel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPanel(prev => !prev);
  };

  const closePanel = () => {
    setShowPanel(false);
  };

  const handleSend = () => {
    if (!inputText.trim() || !matchId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(matchId, inputText.trim());
    setInputText('');
  };

  const handleOpenMeetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMeetupModal(true);
    setMeetupStep('location');
    setSelectedLocation(null);
    setSelectedDate(days[0].value);
    setSelectedTime('10:00 AM');
    setMeetupNote('');
    setLocationSearch('');
  };

  const handleSelectLocation = (loc: typeof locations[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(loc);
    setMeetupStep('details');
  };

  const handleSendMeetup = () => {
    if (!selectedLocation || !selectedDate || !selectedTime || !matchId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const meetup: MeetupAttachment = {
      locationId: selectedLocation.id,
      locationName: selectedLocation.name,
      date: selectedDate,
      time: selectedTime,
      note: meetupNote.trim() || undefined,
    };
    sendMeetupMessage(matchId, meetup);
    setShowMeetupModal(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
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

      <View style={[styles.inputContainer, { paddingBottom: showPanel ? 0 : insets.bottom + (Platform.OS === 'web' ? 34 : 8) }]}>
        <View style={styles.inputRow}>
          <Pressable
            onPress={handleOpenMeetup}
            style={({ pressed }) => [styles.attachButton, pressed && { opacity: 0.6 }]}
            testID="meetup-attach-button"
          >
            <Ionicons name="calendar" size={22} color={Colors.accent} />
          </Pressable>
          <Pressable
            onPress={togglePanel}
            style={({ pressed }) => [styles.attachButton, pressed && { opacity: 0.6 }]}
            testID="emoji-panel-button"
          >
            <Ionicons
              name={showPanel ? 'happy' : 'happy-outline'}
              size={22}
              color={Colors.secondary}
            />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onFocus={closePanel}
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

      {showPanel && (
        <View style={[styles.panelContainer, { height: PANEL_HEIGHT + insets.bottom + (Platform.OS === 'web' ? 34 : 0) }]}>
          <View style={styles.panelTabBar}>
            <Pressable
              style={[styles.panelTabBtn, panelTab === 'emojis' && styles.panelTabBtnActive]}
              onPress={() => setPanelTab('emojis')}
            >
              <Text style={[styles.panelTabText, panelTab === 'emojis' && styles.panelTabTextActive]}>Emojis</Text>
            </Pressable>
            <Pressable
              style={[styles.panelTabBtn, panelTab === 'gifs' && styles.panelTabBtnActive]}
              onPress={() => setPanelTab('gifs')}
            >
              <Text style={[styles.panelTabText, panelTab === 'gifs' && styles.panelTabTextActive]}>GIFs</Text>
            </Pressable>
          </View>
          {panelTab === 'emojis' ? (
            <EmojiPanel onSelectEmoji={handleSelectEmoji} />
          ) : (
            <GifPanel matchId={matchId || ''} onSend={closePanel} />
          )}
        </View>
      )}

      <Modal visible={showMeetupModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: Platform.OS === 'web' ? 20 : insets.top }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => {
                if (meetupStep === 'details') {
                  setMeetupStep('location');
                } else {
                  setShowMeetupModal(false);
                }
              }}>
                <Ionicons name={meetupStep === 'details' ? 'chevron-back' : 'close'} size={24} color={Colors.textSecondary} />
              </Pressable>
              <Text style={styles.modalTitle}>
                {meetupStep === 'location' ? 'Pick a Spot' : 'Set the Details'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {meetupStep === 'location' ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.searchContainer}>
                  <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={Colors.textTertiary} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search places..."
                      placeholderTextColor={Colors.textTertiary}
                      value={locationSearch}
                      onChangeText={setLocationSearch}
                    />
                  </View>
                </View>
                {filteredLocations.map(loc => (
                  <Pressable
                    key={loc.id}
                    style={({ pressed }) => [styles.locationRow, pressed && { backgroundColor: Colors.backgroundSecondary }]}
                    onPress={() => handleSelectLocation(loc)}
                  >
                    <View style={styles.locationIconWrap}>
                      <Ionicons name={getLocationIcon(loc.id) as any} size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName}>{loc.name}</Text>
                      <Text style={styles.locationAddress}>{loc.address}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.selectedSpot}>
                  <View style={styles.selectedSpotIcon}>
                    <Ionicons name={getLocationIcon(selectedLocation?.id || '') as any} size={22} color={Colors.white} />
                  </View>
                  <View>
                    <Text style={styles.selectedSpotName}>{selectedLocation?.name}</Text>
                    <Text style={styles.selectedSpotAddr}>{selectedLocation?.address}</Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
                  {days.map(day => (
                    <Pressable
                      key={day.value}
                      style={[styles.chip, selectedDate === day.value && styles.chipSelected]}
                      onPress={() => setSelectedDate(day.value)}
                    >
                      <Text style={[styles.chipText, selectedDate === day.value && styles.chipTextSelected]}>{day.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.sectionLabel}>Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
                  {TIME_SLOTS.map(t => (
                    <Pressable
                      key={t}
                      style={[styles.chip, selectedTime === t && styles.chipSelected]}
                      onPress={() => setSelectedTime(t)}
                    >
                      <Text style={[styles.chipText, selectedTime === t && styles.chipTextSelected]}>{t}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.sectionLabel}>Add a Note (optional)</Text>
                <View style={styles.noteInputWrap}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="e.g. Let's grab coffee while the kids play!"
                    placeholderTextColor={Colors.textTertiary}
                    value={meetupNote}
                    onChangeText={setMeetupNote}
                    multiline
                    maxLength={150}
                  />
                </View>

                <View style={styles.previewSection}>
                  <Text style={styles.sectionLabel}>Preview</Text>
                  <View style={styles.previewCard}>
                    <View style={styles.meetupHeader}>
                      <View style={styles.meetupIconWrap}>
                        <Ionicons name={getLocationIcon(selectedLocation?.id || '') as any} size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.meetupLabel}>Meetup Invite</Text>
                    </View>
                    <Text style={styles.meetupLocation}>{selectedLocation?.name}</Text>
                    <View style={styles.meetupDetailRow}>
                      <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.meetupDetailText}>{formatMeetupDate(selectedDate)}</Text>
                      <Ionicons name="time-outline" size={14} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
                      <Text style={styles.meetupDetailText}>{selectedTime}</Text>
                    </View>
                    {meetupNote.trim() ? (
                      <Text style={styles.meetupNote}>"{meetupNote.trim()}"</Text>
                    ) : null}
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.sendMeetupBtn, pressed && { opacity: 0.85 }]}
                  onPress={handleSendMeetup}
                  testID="send-meetup-button"
                >
                  <Ionicons name="send" size={18} color={Colors.white} />
                  <Text style={styles.sendMeetupText}>Send Meetup Invite</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  gifBubbleWrap: {
    maxWidth: '65%',
  },
  gifBubbleImage: {
    width: 200,
    height: 150,
    borderRadius: 16,
  },
  meetupCard: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  meetupCardOther: {
    backgroundColor: Colors.white,
    borderColor: Colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  meetupCardOwn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  meetupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetupIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  meetupIconWrapOwn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  meetupLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  meetupLabelOwn: {
    color: 'rgba(255,255,255,0.8)',
  },
  meetupLocation: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 6,
  },
  meetupLocationOwn: {
    color: Colors.white,
  },
  meetupDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetupDetailText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  meetupDetailTextOwn: {
    color: 'rgba(255,255,255,0.85)',
  },
  meetupNote: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    fontStyle: 'italic' as const,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  meetupNoteOwn: {
    color: 'rgba(255,255,255,0.8)',
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
  attachButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
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
  panelContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  panelTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  panelTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  panelTabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  panelTabText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textTertiary,
  },
  panelTabTextActive: {
    color: Colors.primary,
  },
  emojiPanel: {
    flex: 1,
  },
  emojiCategoryBar: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  emojiCategoryTab: {
    width: 40,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCategoryTabActive: {
    backgroundColor: Colors.blush,
  },
  emojiCategoryIcon: {
    fontSize: 20,
  },
  emojiItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  emojiText: {
    fontSize: 28,
  },
  gifPanel: {
    flex: 1,
  },
  gifSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  gifSearchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    marginLeft: 8,
    paddingVertical: 2,
  },
  gifCenterState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  gifErrorText: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
  },
  gifItemWrap: {
    flex: 1,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gifItemImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  giphyAttribution: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    marginLeft: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  locationIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  locationAddress: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedSpot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  selectedSpotIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  selectedSpotName: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  selectedSpotAddr: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  chipScroll: {
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  noteInputWrap: {
    marginHorizontal: 20,
  },
  noteInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top' as const,
  },
  previewSection: {
    marginTop: 4,
  },
  previewCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sendMeetupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  sendMeetupText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.white,
  },
});
