import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { safeTextInputStyles } from "../theme/inputStyles";

const {
  formatIsoDateForDisplay,
  isoDateFromLocalDate,
  parseIsoDate,
  tomorrow,
} = require("../utils/date.cjs");

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const EDGE_ITEMS = Math.floor(VISIBLE_ITEMS / 2);
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function formatWheelValue(value, kind) {
  if (kind === "year") return String(value);
  return String(value).padStart(2, "0");
}

function WheelColumn({ kind, label, onSelect, selectedValue, values }) {
  const listRef = useRef(null);
  const offsetRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const settleTimerRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    Math.max(0, values.indexOf(selectedValue)),
  );

  const maximumOffset = Math.max(0, (values.length - 1) * ITEM_HEIGHT);

  const indexFromOffset = (offsetY) =>
    clamp(Math.round(offsetY / ITEM_HEIGHT), 0, values.length - 1);

  const scrollToIndex = (index, animated) => {
    const safeIndex = clamp(index, 0, values.length - 1);
    const nextOffset = safeIndex * ITEM_HEIGHT;

    offsetRef.current = nextOffset;
    setHighlightedIndex(safeIndex);
    listRef.current?.scrollToOffset({
      animated,
      offset: nextOffset,
    });
  };

  const settleAtOffset = (offsetY, animated = true) => {
    const index = indexFromOffset(offsetY);
    const nextValue = values[index];

    scrollToIndex(index, animated);

    if (nextValue !== selectedValue) {
      onSelect(nextValue);
    }
  };

  const scheduleSettle = (offsetY) => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = setTimeout(() => {
      settleAtOffset(offsetY);
    }, 120);
  };

  useEffect(() => {
    const index = Math.max(0, values.indexOf(selectedValue));
    const timer = setTimeout(() => {
      scrollToIndex(index, false);
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedValue, values]);

  useEffect(
    () => () => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    },
    [],
  );

  const webPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => Platform.OS === "web",
        onMoveShouldSetPanResponder: (_event, gestureState) =>
          Platform.OS === "web" && Math.abs(gestureState.dy) > 3,
        onPanResponderGrant: () => {
          dragStartOffsetRef.current = offsetRef.current;
        },
        onPanResponderMove: (_event, gestureState) => {
          const nextOffset = clamp(
            dragStartOffsetRef.current - gestureState.dy,
            0,
            maximumOffset,
          );

          offsetRef.current = nextOffset;
          setHighlightedIndex(indexFromOffset(nextOffset));
          listRef.current?.scrollToOffset({
            animated: false,
            offset: nextOffset,
          });
        },
        onPanResponderRelease: () => {
          settleAtOffset(offsetRef.current);
        },
        onPanResponderTerminate: () => {
          settleAtOffset(offsetRef.current);
        },
      }),
    [maximumOffset, selectedValue, values],
  );

  return (
    <View style={styles.wheelColumn}>
      <Text style={styles.wheelLabel}>{label}</Text>

      <View
        accessibilityLabel={`Chọn ${label.toLowerCase()}`}
        accessibilityRole="adjustable"
        style={styles.wheelViewport}
        {...(Platform.OS === "web" ? webPanResponder.panHandlers : {})}
      >
        <View pointerEvents="none" style={styles.selectionBand} />
        <View pointerEvents="none" style={styles.selectionTopLine} />
        <View pointerEvents="none" style={styles.selectionBottomLine} />

        <FlatList
          ref={listRef}
          bounces={false}
          contentContainerStyle={styles.wheelContent}
          data={values}
          decelerationRate="fast"
          disableIntervalMomentum
          getItemLayout={(_data, index) => ({
            index,
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
          })}
          initialScrollIndex={Math.max(0, values.indexOf(selectedValue))}
          keyExtractor={(item) => `${kind}-${item}`}
          nestedScrollEnabled
          onMomentumScrollEnd={(event) => {
            settleAtOffset(event.nativeEvent.contentOffset.y);
          }}
          onScroll={(event) => {
            const offsetY = clamp(
              event.nativeEvent.contentOffset.y,
              0,
              maximumOffset,
            );

            offsetRef.current = offsetY;
            setHighlightedIndex(indexFromOffset(offsetY));
            scheduleSettle(offsetY);
          }}
          onScrollEndDrag={(event) => {
            scheduleSettle(event.nativeEvent.contentOffset.y);
          }}
          renderItem={({ index, item }) => {
            const distance = Math.abs(index - highlightedIndex);
            const isSelected = distance === 0;

            return (
              <View style={styles.wheelItem}>
                <Text
                  style={[
                    styles.wheelItemText,
                    distance === 1 && styles.wheelItemTextNear,
                    distance >= 2 && styles.wheelItemTextFar,
                    isSelected && styles.wheelItemTextSelected,
                  ]}
                >
                  {formatWheelValue(item, kind)}
                </Text>
              </View>
            );
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={ITEM_HEIGHT}
          style={styles.wheelList}
        />
      </View>
    </View>
  );
}

export function TargetDateField({ disabled = false, onChange, value }) {
  const minimumDate = useMemo(() => tomorrow(), []);
  const maximumYear = minimumDate.getFullYear() + 10;
  const selectedDate = parseIsoDate(value) || minimumDate;
  const displayValue = formatIsoDateForDisplay(value);

  const [showPicker, setShowPicker] = useState(false);
  const [draftDay, setDraftDay] = useState(selectedDate.getDate());
  const [draftMonth, setDraftMonth] = useState(selectedDate.getMonth() + 1);
  const [draftYear, setDraftYear] = useState(selectedDate.getFullYear());
  const [pickerError, setPickerError] = useState("");

  const yearValues = useMemo(
    () => range(minimumDate.getFullYear(), maximumYear),
    [maximumYear, minimumDate],
  );
  const monthValues = useMemo(() => range(1, 12), []);
  const dayValues = useMemo(
    () => range(1, daysInMonth(draftYear, draftMonth)),
    [draftMonth, draftYear],
  );

  const openPicker = () => {
    const date = parseIsoDate(value) || minimumDate;

    setDraftDay(date.getDate());
    setDraftMonth(date.getMonth() + 1);
    setDraftYear(date.getFullYear());
    setPickerError("");
    setShowPicker(true);
  };

  const updateMonth = (month) => {
    setDraftMonth(month);
    setDraftDay((currentDay) =>
      Math.min(currentDay, daysInMonth(draftYear, month)),
    );
    setPickerError("");
  };

  const updateYear = (year) => {
    setDraftYear(year);
    setDraftDay((currentDay) =>
      Math.min(currentDay, daysInMonth(year, draftMonth)),
    );
    setPickerError("");
  };

  const confirmDate = () => {
    const nextDate = new Date(draftYear, draftMonth - 1, draftDay);
    nextDate.setHours(0, 0, 0, 0);

    if (nextDate.getTime() < minimumDate.getTime()) {
      setPickerError("Thời hạn phải sau ngày hôm nay.");
      return;
    }

    onChange(isoDateFromLocalDate(nextDate));
    setPickerError("");
    setShowPicker(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Thời hạn hoàn thành</Text>

      <Pressable
        accessibilityLabel={`Thời hạn hoàn thành: ${displayValue || "Chọn ngày"}`}
        accessibilityRole="button"
        disabled={disabled}
        onPress={openPicker}
        style={({ pressed }) => [
          styles.input,
          styles.dateButton,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text style={[styles.dateText, !displayValue && styles.placeholder]}>
          {displayValue || "DD/MM/YYYY"}
        </Text>
        <Text accessibilityElementsHidden style={styles.calendarIcon}>
          LỊCH
        </Text>
      </Pressable>

      <Text style={styles.helperText}>Chạm để chọn ngày, tháng và năm.</Text>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
        transparent
        visible={showPicker}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Đóng bộ chọn ngày"
            onPress={() => setShowPicker(false)}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Chọn thời hạn</Text>
            <Text style={styles.dialogPreview}>
              {String(draftDay).padStart(2, "0")}/
              {String(draftMonth).padStart(2, "0")}/{draftYear}
            </Text>

            <Text style={styles.swipeHint}>Vuốt lên hoặc xuống để chọn</Text>

            <View style={styles.wheelsRow}>
              <WheelColumn
                kind="day"
                label="Ngày"
                onSelect={(day) => {
                  setDraftDay(day);
                  setPickerError("");
                }}
                selectedValue={draftDay}
                values={dayValues}
              />
              <WheelColumn
                kind="month"
                label="Tháng"
                onSelect={updateMonth}
                selectedValue={draftMonth}
                values={monthValues}
              />
              <WheelColumn
                kind="year"
                label="Năm"
                onSelect={updateYear}
                selectedValue={draftYear}
                values={yearValues}
              />
            </View>

            {pickerError ? (
              <Text style={styles.errorText}>{pickerError}</Text>
            ) : null}

            <View style={styles.dialogActions}>
              <Pressable
                onPress={() => setShowPicker(false)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                onPress={confirmDate}
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.confirmButtonText}>Chọn ngày</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: colors.mossText,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  input: {
    ...safeTextInputStyles.singleLine,
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.onSurface,
  },
  dateButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateText: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: "600",
  },
  placeholder: {
    color: colors.onSurfaceVariant,
    fontWeight: "400",
  },
  calendarIcon: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  helperText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 520,
    padding: 20,
    width: "100%",
  },
  dialogTitle: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  dialogPreview: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
    textAlign: "center",
  },
  swipeHint: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  wheelsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  wheelColumn: {
    flex: 1,
    minWidth: 0,
  },
  wheelLabel: {
    color: colors.mossText,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  wheelViewport: {
    cursor: Platform.OS === "web" ? "grab" : undefined,
    height: WHEEL_HEIGHT,
    overflow: "hidden",
    position: "relative",
    userSelect: Platform.OS === "web" ? "none" : undefined,
  },
  wheelList: {
    height: WHEEL_HEIGHT,
  },
  wheelContent: {
    paddingBottom: ITEM_HEIGHT * EDGE_ITEMS,
    paddingTop: ITEM_HEIGHT * EDGE_ITEMS,
  },
  selectionBand: {
    backgroundColor: "rgba(110, 166, 56, 0.16)",
    borderRadius: 10,
    height: ITEM_HEIGHT,
    left: 2,
    position: "absolute",
    right: 2,
    top: ITEM_HEIGHT * EDGE_ITEMS,
  },
  selectionTopLine: {
    backgroundColor: colors.primaryContainer,
    height: 1,
    left: 5,
    position: "absolute",
    right: 5,
    top: ITEM_HEIGHT * EDGE_ITEMS,
  },
  selectionBottomLine: {
    backgroundColor: colors.primaryContainer,
    height: 1,
    left: 5,
    position: "absolute",
    right: 5,
    top: ITEM_HEIGHT * (EDGE_ITEMS + 1),
  },
  wheelItem: {
    alignItems: "center",
    height: ITEM_HEIGHT,
    justifyContent: "center",
  },
  wheelItemText: {
    color: colors.onSurfaceVariant,
    fontSize: 17,
    fontWeight: "500",
    opacity: 0.75,
  },
  wheelItemTextNear: {
    opacity: 0.9,
  },
  wheelItemTextFar: {
    opacity: 0.4,
  },
  wheelItemTextSelected: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    opacity: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  dialogActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 18,
  },
  cancelButton: {
    alignItems: "center",
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 18,
  },
  cancelButtonText: {
    color: colors.mossText,
    fontSize: 15,
    fontWeight: "700",
  },
  confirmButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 18,
  },
  confirmButtonText: {
    color: colors.surfaceRice,
    fontSize: 15,
    fontWeight: "800",
  },
});
