import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { colors, typography, spacing, shadows } from '../theme';
import { getOrderHistory, type PastOrder } from '../services/orderHistory';
import { getSavedAddress, saveAddress, clearSavedAddress } from '../services/addressService';
import { formatPrice } from '../utils/formatPrice';

type HamburgerMenuProps = {
  userName?: string;
  userId?: string;
  userPoints?: number;
  onLogout: () => void;
  onReorder: (items: { id: string; name: string; price: number }[]) => void;
  onSelectJuices: () => void;
  onTrackOrder: (orderId: string) => void;
  onReviews: () => void;
};

const APP_VERSION = '0.0.1';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function PastOrdersSheet({ visible, onClose, onReorder, onTrackOrder }: { visible: boolean; onClose: () => void; onReorder: (items: { id: string; name: string; price: number }[]) => void; onTrackOrder: (orderId: string) => void }) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<PastOrder[]>([]);

  useEffect(() => {
    if (visible) {
      getOrderHistory().then(setOrders);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[sheetStyles.container, { paddingTop: Math.max(spacing.lg, insets.top) }]}>
        <View style={sheetStyles.header}>
          <Text style={sheetStyles.title}>Past orders</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={sheetStyles.close}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={[sheetStyles.scrollContent, { paddingBottom: Math.max(spacing.lg, insets.bottom) }]}
          showsVerticalScrollIndicator={false}
        >
          {orders.length === 0 ? (
            <View style={sheetStyles.emptyState}>
              <Text style={sheetStyles.emptyTitle}>No orders yet</Text>
              <Text style={sheetStyles.emptyMessage}>
                Your order history will appear here after you place your first order.
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.orderId} style={sheetStyles.orderCard}>
                <View style={sheetStyles.orderHeader}>
                  <Text style={sheetStyles.orderId}>{order.orderId}</Text>
                  <Text style={sheetStyles.orderDate}>{formatDate(order.placedAt)}</Text>
                </View>
                {order.items.map((item, i) => (
                  <View key={i} style={sheetStyles.itemRow}>
                    <Text style={sheetStyles.itemName}>{item.name}</Text>
                    <Text style={sheetStyles.itemPrice}>{formatPrice(item.price)}</Text>
                  </View>
                ))}
                <View style={sheetStyles.totalRow}>
                  <Text style={sheetStyles.totalLabel}>Total</Text>
                  <Text style={sheetStyles.totalPrice}>{formatPrice(order.total)}</Text>
                </View>
                {((order.pointsEarned ?? 0) > 0 || (order.pointsUsed ?? 0) > 0) && (
                  <View style={sheetStyles.pointsInfoRow}>
                    {(order.pointsEarned ?? 0) > 0 && (
                      <Text style={sheetStyles.pointsEarnedText}>+{order.pointsEarned} pts earned</Text>
                    )}
                    {(order.pointsUsed ?? 0) > 0 && (
                      <Text style={sheetStyles.pointsUsedText}>{order.pointsUsed} pts used</Text>
                    )}
                  </View>
                )}
                <Text style={sheetStyles.orderAddress} numberOfLines={1}>{order.address}</Text>
                <View style={sheetStyles.actionRow}>
                  {order.status && order.status !== 'delivered' && (
                    <TouchableOpacity
                      style={sheetStyles.trackButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        onClose();
                        onTrackOrder(order.orderId);
                      }}
                    >
                      <Text style={sheetStyles.trackText}>Track</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[sheetStyles.reorderButton, order.status && order.status !== 'delivered' && { flex: 1 }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onReorder(order.items);
                    }}
                  >
                    <Text style={sheetStyles.reorderText}>Reorder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function SavedAddressSheet({ visible, onClose, userId }: { visible: boolean; onClose: () => void; userId: string }) {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      setLoading(true);
      getSavedAddress(userId).then((addr) => {
        setAddress(addr ?? '');
        setLoading(false);
      });
    }
  }, [visible, userId]);

  const handleSave = async () => {
    if (!address.trim()) return;
    setSaving(true);
    const ok = await saveAddress(userId, address);
    setSaving(false);
    if (ok) {
      Toast.show({ type: 'success', text1: 'Address saved', text2: 'Your address will be auto-filled on delivery.' });
      onClose();
    } else {
      Toast.show({ type: 'error', text1: 'Failed to save', text2: 'Please try again.' });
    }
  };

  const handleClear = async () => {
    setSaving(true);
    const ok = await clearSavedAddress(userId);
    setSaving(false);
    if (ok) {
      setAddress('');
      Toast.show({ type: 'success', text1: 'Address removed' });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[addressStyles.container, { paddingTop: Math.max(spacing.lg, insets.top) }]}>
          <View style={addressStyles.header}>
            <Text style={addressStyles.title}>Saved address</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={addressStyles.close}>Done</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={addressStyles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={addressStyles.body}>
              <Text style={addressStyles.label}>Delivery address</Text>
              <TextInput
                style={addressStyles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="123 Main St, Apt 4B, City, ZIP"
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />
              <Text style={addressStyles.hint}>
                This address will be auto-filled when you place an order.
              </Text>

              <TouchableOpacity
                style={[addressStyles.saveButton, !address.trim() && addressStyles.saveButtonDisabled]}
                activeOpacity={0.7}
                onPress={handleSave}
                disabled={!address.trim() || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={addressStyles.saveButtonText}>Save address</Text>
                )}
              </TouchableOpacity>

              {address.trim().length > 0 && (
                <TouchableOpacity
                  style={addressStyles.clearButton}
                  activeOpacity={0.7}
                  onPress={handleClear}
                  disabled={saving}
                >
                  <Text style={addressStyles.clearButtonText}>Remove saved address</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function HamburgerMenu({ userName, userId, userPoints, onLogout, onReorder, onSelectJuices, onTrackOrder, onReviews }: HamburgerMenuProps) {
  const [visible, setVisible] = useState(false);
  const [ordersVisible, setOrdersVisible] = useState(false);
  const [addressVisible, setAddressVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.trigger}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {userName && (
              <View style={styles.userSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  {(userPoints ?? 0) > 0 && (
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsBadgeText}>{userPoints} pts</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.loyaltyRow}>
              <View style={styles.loyaltyIcon}>
                <Text style={styles.loyaltyIconText}>★</Text>
              </View>
              <View style={styles.loyaltyInfo}>
                <Text style={styles.loyaltyLabel}>Loyalty points</Text>
                <Text style={styles.loyaltyBalance}>{userPoints ?? 0} pts available</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                onSelectJuices();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Select juices</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                setOrdersVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Past orders</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                setAddressVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Saved address</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                onReviews();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Reviews</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                onLogout();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>SapJuice v{APP_VERSION}</Text>
            </View>
          </View>
        </Pressable>
      </Modal>

      <PastOrdersSheet visible={ordersVisible} onClose={() => setOrdersVisible(false)} onReorder={onReorder} onTrackOrder={onTrackOrder} />
      {userId && <SavedAddressSheet visible={addressVisible} onClose={() => setAddressVisible(false)} userId={userId} />}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 20,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.text,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    marginTop: 56,
    marginRight: spacing.base,
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    ...shadows.lg,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  pointsBadge: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  pointsBadgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 11,
  },
  loyaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  loyaltyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  loyaltyIconText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  loyaltyInfo: {
    flex: 1,
  },
  loyaltyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loyaltyBalance: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.sm,
  },
  menuItem: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  menuItemText: {
    ...typography.body,
    color: colors.text,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
  },
  versionRow: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  versionLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

const sheetStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  close: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderId: {
    ...typography.captionBold,
    color: colors.primary,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  orderDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
  },
  itemPrice: {
    ...typography.label,
    color: colors.textSecondary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  totalLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  totalPrice: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  pointsInfoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pointsEarnedText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  pointsUsedText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  orderAddress: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  trackButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  trackText: {
    ...typography.captionBold,
    color: colors.primaryDark,
    fontSize: 14,
  },
  reorderButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reorderText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
});

const addressStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  close: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    ...typography.body,
    color: colors.text,
    height: 120,
    textAlignVertical: 'top',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  clearButtonText: {
    ...typography.body,
    color: colors.error,
  },
});
