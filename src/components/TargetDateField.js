import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
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

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function WheelColumn({ label, onSelect, selectedValue, values }) {
  const listRef = useRef(null);

  const scrollToValue = (value, animated = true) => {
    const index = values.indexOf(value);
    if (index < 0) return;

    listRef.current?.scrollToOffset({
      animated,
      offset: index * ITEM_HEIGHT,
    });
  };

  const selectFromOffset = (offsetY) => {
    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
    const index = Math.max(0, Math.min(values.length - 1, rawIndex));
    const nextValue = values[index];

    if (nextValue !== selectedValue) {
      onSelect(nextValue);
    }

    scrollToValue(nextValue);
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollToValue(selectedValue, false);
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedValue, values]);

  return (
    <View style={styles.wheelColumn}>
      <Text style={styles.wheelLabel}>{label}</Text>
      <View style={styles.wheelViewport}>
        <View pointerEvents="none" style={styles.selectionBand} />
        <FlatList
          ref={listRef}
          contentContainerStyle={styles.wheelContent}
          data={values}
          decelerationRate="fast"
          getItemLayout={(_data, index) => ({
            index,
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
          })}
          initialScrollIndex={Math.max(0, values.indexOf(selectedValue))}
          keyExtractor={(item) => String(item)}
          onMomentumScrollEnd={(event) => {
            selectFromOffset(event.nativeEvent.contentOffset.y);
          }}
          onScrollEndDrag={(event) => {
            selectFromOffset(event.nativeEvent.contentOffset.y);
          }}
          renderItem={({ item }) => {
            const isSelected = item === selectedValue;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onSelect(item);
                  scrollToValue(item);
                }}
                style={styles.wheelItem}
              >
                <Text
                  style={[
                    styles.wheelItemText,
                    isSelected && styles.wheelItemTextSelected,
                  ]}
                >
                  {String(item).padStart(2, "0")}
                </Text>
              </Pressable>
            );
          }}
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

            <View style={styles.wheelsRow}>
              <WheelColumn
                label="Ngày"
                onSelect={(day) => {
                  setDraftDay(day);
                  setPickerError("");
                }}
                selectedValue={draftDay}
                values={dayValues}
              />
              <WheelColumn
                label="Tháng"
                onSelect={updateMonth}
                selectedValue={draftMonth}
                values={monthValues}
              />
              <WheelColumn
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
  wheelsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
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
    height: WHEEL_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  wheelList: {
    height: WHEEL_HEIGHT,
  },
  wheelContent: {
    paddingBottom: ITEM_HEIGHT * 2,
    paddingTop: ITEM_HEIGHT * 2,
  },
  selectionBand: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    height: ITEM_HEIGHT,
    left: 0,
    position: "absolute",
    right: 0,
    top: ITEM_HEIGHT * 2,
  },
  wheelItem: {
    alignItems: "center",
    height: ITEM_HEIGHT,
    justifyContent: "center",
  },
  wheelItemText: {
    color: colors.onSurfaceVariant,
    fontSize: 17,
    fontWeight: "600",
  },
  wheelItemTextSelected: {
    color: colors.onPrimaryContainer,
    fontWeight: "900",
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
