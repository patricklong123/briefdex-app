import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native';
import { OnboardingLayout } from './OnboardingLayout';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, spacing } from '../../theme/tokens';

const LOGOS = ['FMA', 'MAS', 'FSC', 'Chapman Tripp', 'KPMG', 'PwC', 'Macquarie Bank', 'Jarden'];
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - spacing.xxl * 2;

const QUOTES = [
  {
    id: '1',
    quote: 'Briefdex replaced 30 minutes of scrolling every morning. I show up to client meetings all ready across the market.',
    credit: 'Jarden, Asset Manager',
  },
  {
    id: '2',
    quote: 'Oh it\'s perfect, I jump on the train every morning with my headphones in and can get up to date with everything happening in the markets before I get to work.',
    credit: 'Macquarie, Investment Banker',
  },
  {
    id: '3',
    quote: 'I\'ve got my notifications on Briefdex set 1 minute before my alarm goes off. Once my alarm goes off I just click the notification and the daily wrap is playing while I\'m still in bed. Talk about making the most of every morning.',
    credit: 'Business Advisory Owner',
  },
];

export function SocialProofScreen({ onNext }: { onNext: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const goToIndex = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <OnboardingLayout centered footer={<GoldButton label="Continue" onPress={onNext} />}>
      <Text style={styles.heading}>Built for people like you.</Text>

      {/* Static top card */}
      <View style={styles.card}>
        <View style={styles.logosRow}>
          {LOGOS.map((l) => (
            <View key={l} style={styles.logoPill}>
              <Text style={styles.logoText}>{l}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.cardBody}>
          Beta tested by professionals across NZ's leading finance and legal institutions.
        </Text>
      </View>

      {/* Swipeable quote carousel — bleeds to screen edges, snaps per card */}
      <FlatList
        ref={listRef}
        data={QUOTES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + spacing.md}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.carousel}
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, gap: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.quoteCard}>
            <Text style={styles.quote}>"{item.quote}"</Text>
            <Text style={styles.credit}>— {item.credit}</Text>
          </View>
        )}
      />

      {/* Pagination dots — tappable */}
      <View style={styles.dots}>
        {QUOTES.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => goToIndex(i)}
            hitSlop={10}
          >
            <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
          </Pressable>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.white,
    marginBottom: spacing.xxl,
  },
  card: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: spacing.lg,
  },
  logosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  logoPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  logoText: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.gold },
  cardBody: { fontFamily: fonts.body, fontSize: 12, color: colors.textDim, lineHeight: 18 },

  // Carousel bleeds outside the layout's horizontal padding
  carousel: {
    marginHorizontal: -spacing.xxl,
  },
  quoteCard: {
    width: CARD_W,
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  quote: {
    fontFamily: fonts.bodyLight,
    fontStyle: 'italic',
    fontSize: 11,
    color: colors.textDim,
    lineHeight: 17,
  },
  credit: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.gold, marginTop: 10 },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.gold, width: 16 },
});
