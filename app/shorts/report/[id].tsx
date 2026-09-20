// component
import { ScrollView, StyleSheet, View as RNView } from "react-native";
import { Text, View } from "@/components/themed";
// zustand
import { ShortsReportTypes, useShortsStore } from "@/hooks/use-shorts-store";
// hooks
import useCurrentThemeColor from "@/hooks/use-current-theme-color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "@/hooks/use-t";
import { useLanguage } from "@/hooks/use-user-store";
// lib
import { tBodyPart } from "@/lib/i18n";
// expo
import { useLocalSearchParams } from "expo-router";
// icon
import { BODY_PART_ICON } from "@/constants/body-part";

// 점 하나 + 본문 한 줄. good/bad/improve/drills가 전부 같은 모양이다.
const Bullet = ({ color, children }: { color: string; children: string }) => (
  <RNView style={styles.bullet}>
    <RNView style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.bulletText}>{children}</Text>
  </RNView>
);

const Section = ({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: string[];
}) => {
  const themeColor = useCurrentThemeColor();
  // AI가 빈 배열을 줄 수 있다 — 제목만 덩그러니 남기지 않는다
  if (items.length === 0) return null;

  return (
    <RNView style={[styles.card, { backgroundColor: themeColor.itemColor }]}>
      <Text style={[styles.cardTitle, { color }]}>{title}</Text>
      {items.map((item, index) => (
        <Bullet key={index} color={color}>
          {item}
        </Bullet>
      ))}
    </RNView>
  );
};

export default function ShortsReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeColor = useCurrentThemeColor();
  const insets = useSafeAreaInsets();
  const lang = useLanguage();
  const t = useT();

  const report: ShortsReportTypes | undefined = useShortsStore(
    (state) => state.videos.find((video) => video.id === Number(id))?.report,
  );

  // 보는 도중 영상이 지워지면 리포트도 같이 사라진다
  if (!report) return null;

  const PartIcon = BODY_PART_ICON[report.bodyPart];

  return (
    <View style={{ flex: 1, backgroundColor: themeColor.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          // 면책 문구가 화면 끝에 붙어 잘린 것처럼 보였다
          { paddingBottom: insets.bottom + 56 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <RNView
          style={[styles.card, { backgroundColor: themeColor.itemColor }]}
        >
          <RNView style={styles.header}>
            <PartIcon width={40} height={40} />
            <RNView style={styles.headerText}>
              <Text style={styles.workout}>{report.workout}</Text>
              <Text style={[styles.part, { color: themeColor.subText }]}>
                {tBodyPart(report.bodyPart, lang)}
              </Text>
            </RNView>
          </RNView>

          <RNView style={styles.scoreRow}>
            <Text style={[styles.scoreLabel, { color: themeColor.subText }]}>
              {t("ai.score")}
            </Text>
            <Text style={[styles.score, { color: themeColor.tintText }]}>
              {report.score}
            </Text>
          </RNView>
          <RNView
            style={[styles.track, { backgroundColor: themeColor.divider }]}
          >
            <RNView
              style={[
                styles.fill,
                { width: `${report.score}%`, backgroundColor: themeColor.tint },
              ]}
            />
          </RNView>
        </RNView>

        {report.risk ? (
          <RNView
            style={[styles.card, { backgroundColor: `${themeColor.fail}22` }]}
          >
            <Text style={[styles.cardTitle, { color: themeColor.fail }]}>
              {t("ai.risk")}
            </Text>
            <Text style={styles.bulletText}>{report.risk}</Text>
          </RNView>
        ) : null}

        <Section
          title={t("ai.good")}
          color={themeColor.success}
          items={report.good}
        />
        <Section
          title={t("ai.bad")}
          color={themeColor.fail}
          items={report.bad}
        />
        <Section
          title={t("ai.improve")}
          color={themeColor.tintText}
          items={report.improve}
        />

        {report.checkpoints.length > 0 && (
          <RNView
            style={[styles.card, { backgroundColor: themeColor.itemColor }]}
          >
            <Text style={styles.cardTitle}>{t("ai.checkpoints")}</Text>
            {report.checkpoints.map((point, index) => (
              <RNView key={index} style={styles.bullet}>
                <RNView
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        point.status === "caution"
                          ? themeColor.fail
                          : themeColor.tint,
                    },
                  ]}
                />
                <RNView style={styles.checkpointText}>
                  <Text style={styles.joint}>{point.joint}</Text>
                  <Text
                    style={[styles.bulletText, { color: themeColor.subText }]}
                  >
                    {point.note}
                  </Text>
                </RNView>
              </RNView>
            ))}
          </RNView>
        )}

        <Section
          title={t("ai.drills")}
          color={themeColor.tintText}
          items={report.drills}
        />

        {report.camera ? (
          <RNView
            style={[styles.card, { backgroundColor: themeColor.itemColor }]}
          >
            <Text style={[styles.cardTitle, { color: themeColor.subText }]}>
              {t("ai.camera")}
            </Text>
            <Text style={styles.bulletText}>{report.camera}</Text>
          </RNView>
        ) : null}

        <Text style={[styles.disclaimer, { color: themeColor.subText }]}>
          {t("ai.disclaimer")}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  workout: {
    fontSize: 18,
  },
  part: {
    fontFamily: "sb-l",
    fontSize: 13,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  scoreLabel: {
    fontFamily: "sb-l",
    fontSize: 13,
  },
  score: {
    fontFamily: "sb-b",
    fontSize: 26,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  cardTitle: {
    fontSize: 15,
  },
  bullet: {
    flexDirection: "row",
    gap: 10,
  },
  // 첫 줄 글자 높이(19) 한가운데에 맞춘다 — alignItems: center로 두면
  // 여러 줄 본문에서 점이 문단 중앙으로 내려간다
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontFamily: "sb-l",
    fontSize: 14,
    lineHeight: 20,
  },
  checkpointText: {
    flex: 1,
    gap: 2,
  },
  joint: {
    fontSize: 14,
  },
  disclaimer: {
    fontFamily: "sb-l",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
