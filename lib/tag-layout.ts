// 운동 태그 수정모드(드래그 정렬)의 좌표 계산.
//
// 평소에는 flexWrap이 알아서 태그를 흘려주지만, 드래그 중에는 순서가 실시간으로 바뀌고
// 각 태그가 "새 자리로 미끄러져 가야" 하므로 위치를 직접 알아야 한다. 태그는 글자 수마다
// 폭이 달라서(아이폰 앱 아이콘과 달리) 좌표를 손으로 계산하는 수밖에 없다.

export type TagPosition = { x: number; y: number };

export type TagLayout = { positions: TagPosition[]; height: number };

/**
 * 폭이 제각각인 아이템을 `flexWrap:"wrap"` + `justifyContent:"center"` 그리드에 놓았을 때의 좌표.
 * 줄바꿈 지점을 먼저 찾아 한 줄에 담긴 아이템을 모아야 줄 단위 가운데 정렬 오프셋을 낼 수 있다.
 */
export const layoutTags = (
  widths: number[],
  containerWidth: number,
  gap: number,
  rowHeight: number,
): TagLayout => {
  if (widths.length === 0 || containerWidth <= 0) {
    return { positions: [], height: 0 };
  }

  const rows: number[][] = [];
  let row: number[] = [];
  let rowWidth = 0;

  widths.forEach((width, index) => {
    const nextWidth = row.length === 0 ? width : rowWidth + gap + width;
    // 컨테이너보다 넓은 아이템은 혼자서라도 한 줄을 차지한다 (row.length 가드)
    if (row.length > 0 && nextWidth > containerWidth) {
      rows.push(row);
      row = [index];
      rowWidth = width;
      return;
    }
    row.push(index);
    rowWidth = nextWidth;
  });
  rows.push(row);

  const positions: TagPosition[] = [];
  rows.forEach((items, rowIndex) => {
    const total =
      items.reduce((sum, i) => sum + widths[i], 0) + gap * (items.length - 1);
    let x = (containerWidth - total) / 2;
    const y = rowIndex * (rowHeight + gap);
    items.forEach((i) => {
      positions[i] = { x, y };
      x += widths[i] + gap;
    });
  });

  return {
    positions,
    height: rows.length * rowHeight + (rows.length - 1) * gap,
  };
};

/**
 * 드래그 중인 태그의 중심 좌표 → 꽂아 넣을 인덱스.
 *
 * 줄을 먼저 정하고 그 줄 안에서 x로 고른다. 중심점까지의 유클리드 거리로 한 번에 고르면
 * 줄 간격(약 38px)이 태그 폭(60~120px)보다 작아서, 아랫줄 태그 위에 있어도 윗줄이 뽑힌다.
 *
 * `count`는 태그 개수 — 마지막 칸의 `+` 버튼 자리에 떨궈도 맨 뒤까지만 가게 잘라낸다.
 * 아직 좌표가 없으면(측정 전) -1을 돌려주므로 호출부에서 무시할 수 있다.
 */
export const findDropIndex = (
  positions: TagPosition[],
  widths: number[],
  centerX: number,
  centerY: number,
  rowHeight: number,
  count: number,
): number => {
  let rowY: number | null = null;
  let rowDistance = Infinity;

  for (let i = 0; i < count; i += 1) {
    const position = positions[i];
    if (!position) continue;
    const distance = Math.abs(position.y + rowHeight / 2 - centerY);
    if (distance < rowDistance) {
      rowDistance = distance;
      rowY = position.y;
    }
  }

  if (rowY === null) return -1;

  let best = -1;
  let bestDistance = Infinity;

  for (let i = 0; i < count; i += 1) {
    const position = positions[i];
    if (!position || position.y !== rowY) continue;
    const distance = Math.abs(position.x + widths[i] / 2 - centerX);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }

  return best;
};

/** 배열에서 하나를 뽑아 다른 자리에 꽂는다. 범위를 벗어나면 원본을 그대로 돌려준다. */
export const moveItem = <T>(list: T[], from: number, to: number): T[] => {
  if (from === to) return list;
  if (from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};
