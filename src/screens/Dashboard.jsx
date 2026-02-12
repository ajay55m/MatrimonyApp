import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
    Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, moderateScale } from '../utils/responsive';

const { width } = Dimensions.get('window');

// Pink-White-Green-Blue Palette
const COLORS = {
    primary: '#FF4081',
    primaryLight: '#FFE5EF',
    primaryDark: '#E91E63',
    background: '#FAFAFA',
    card: '#FFFFFF',
    textPrimary: '#2C3E50',
    textSecondary: '#7F8C8D',
    textTertiary: '#BDC3C7',
    success: '#00C853',
    warning: '#FFC107',
    danger: '#FF1744',
    info: '#2196F3',
    green: '#4CAF50',
    blue: '#42A5F5',
    border: '#FFB3D9',
    divider: '#ECEFF1',
    // Skeleton shimmer colors
    skeletonBase: '#F0F0F0',
    skeletonHighlight: '#FAFAFA',
};

// ─── Shimmer Hook ─────────────────────────────────────────────────────────────
const useShimmer = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1100,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1100,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
    });

    return opacity;
};

// ─── Skeleton Primitives ──────────────────────────────────────────────────────
const SkeletonBox = ({ width: w, height: h, borderRadius = 8, style }) => {
    const opacity = useShimmer();
    return (
        <Animated.View
            style={[
                {
                    width: w,
                    height: h,
                    borderRadius,
                    backgroundColor: COLORS.skeletonBase,
                    opacity,
                },
                style,
            ]}
        />
    );
};

const SkeletonCircle = ({ size }) => (
    <SkeletonBox width={size} height={size} borderRadius={size / 2} />
);

const SkeletonLine = ({ widthPercent = '100%', height = 12, style }) => (
    <SkeletonBox width={widthPercent} height={height} borderRadius={6} style={style} />
);

// ─── Skeleton: Sidebar Card ───────────────────────────────────────────────────
const SkeletonSidebar = () => (
    <View style={[styles.sidebarCard, { marginBottom: 20 }]}>
        {/* Welcome header */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <SkeletonLine widthPercent="40%" height={11} style={{ marginBottom: 6 }} />
            <SkeletonLine widthPercent="60%" height={16} style={{ marginBottom: 4 }} />
            <SkeletonLine widthPercent="35%" height={11} />
        </View>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <SkeletonCircle size={100} />
        </View>
        {/* Link items */}
        {[1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
                <SkeletonBox width={36} height={36} borderRadius={10} />
                <SkeletonLine widthPercent="65%" height={12} />
            </View>
        ))}
        {/* Divider info rows */}
        {[1, 2].map((i) => (
            <View key={`d${i}`}>
                <View style={styles.sidebarDivider} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }}>
                    <SkeletonBox width={16} height={16} borderRadius={3} />
                    <SkeletonLine widthPercent="50%" height={11} />
                    <SkeletonLine widthPercent="20%" height={11} style={{ marginLeft: 'auto' }} />
                </View>
            </View>
        ))}
    </View>
);

// ─── Skeleton: Membership Card ────────────────────────────────────────────────
const SkeletonMembership = () => (
    <View style={styles.membershipSection}>
        <SkeletonLine widthPercent="55%" height={18} style={{ marginBottom: 16 }} />
        {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.membershipRow, { justifyContent: 'space-between' }]}>
                <SkeletonLine widthPercent="45%" height={13} />
                <SkeletonLine widthPercent="25%" height={13} />
            </View>
        ))}
        <View style={{ backgroundColor: '#FFEBEE', borderRadius: 12, padding: 14, marginTop: 12, borderLeftWidth: 3, borderLeftColor: '#FFB3B3' }}>
            <SkeletonLine widthPercent="100%" height={11} style={{ marginBottom: 6 }} />
            <SkeletonLine widthPercent="75%" height={11} />
        </View>
    </View>
);

// ─── Skeleton: Alert Box ──────────────────────────────────────────────────────
const SkeletonAlert = () => (
    <View style={[styles.alertBox, { marginBottom: 20 }]}>
        <SkeletonBox width={22} height={22} borderRadius={5} />
        <View style={{ flex: 1, gap: 6 }}>
            <SkeletonLine widthPercent="100%" height={11} />
            <SkeletonLine widthPercent="70%" height={11} />
        </View>
    </View>
);

// ─── Skeleton: Quick Info Cards ───────────────────────────────────────────────
const SkeletonQuickInfo = () => {
    const cardW = (width - 60) / 2;
    return (
        <View style={[styles.section, { marginBottom: 25 }]}>
            <SkeletonLine widthPercent="40%" height={18} style={{ marginBottom: 15 }} />
            <View style={styles.statsGrid}>
                {[0, 1, 2, 3].map((i) => (
                    <SkeletonBox
                        key={i}
                        width={cardW}
                        height={scale(95)}
                        borderRadius={20}
                        style={{ elevation: 0 }}
                    />
                ))}
            </View>
        </View>
    );
};

// ─── Skeleton: Random Profiles ────────────────────────────────────────────────
const SkeletonRandomProfiles = () => (
    <View style={styles.section}>
        <SkeletonLine widthPercent="45%" height={18} style={{ marginBottom: 15 }} />
        <View style={[styles.premiumLockBox, { backgroundColor: COLORS.skeletonBase, borderColor: COLORS.skeletonBase }]}>
            <SkeletonCircle size={32} />
            <SkeletonLine widthPercent="90%" height={12} style={{ marginTop: 12 }} />
            <SkeletonLine widthPercent="65%" height={12} style={{ marginTop: 6 }} />
        </View>
    </View>
);

// ─── Full Dashboard Skeleton Screen ──────────────────────────────────────────
const DashboardSkeleton = ({ fadeAnim }) => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        >
            {/* Top gradient placeholder */}
            <View style={skeletonStyles.headerPlaceholder}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <View style={{ gap: 6 }}>
                        <SkeletonBox width={90} height={11} borderRadius={6} style={{ backgroundColor: 'rgba(255,255,255,0.35)' }} />
                        <SkeletonBox width={150} height={22} borderRadius={8} style={{ backgroundColor: 'rgba(255,255,255,0.35)' }} />
                    </View>
                    <SkeletonBox width={44} height={44} borderRadius={22} style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                    <SkeletonBox width={70} height={70} borderRadius={35} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    <View style={skeletonStyles.statsRowPlaceholder}>
                        {[0, 1, 2].map((i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <View style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.25)' }} />}
                                <View style={{ alignItems: 'center', gap: 4 }}>
                                    <SkeletonBox width={35} height={14} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                                    <SkeletonBox width={50} height={10} borderRadius={3} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.leftColumn}>
                    <SkeletonSidebar />
                    <SkeletonMembership />
                </View>
                <View style={styles.rightColumn}>
                    <SkeletonAlert />
                    <SkeletonQuickInfo />
                    <SkeletonRandomProfiles />
                </View>
            </View>
        </ScrollView>
    </Animated.View>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = ({ t }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    // Animation values
    const skeletonOpacity = useRef(new Animated.Value(1)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(18)).current;

    // Staggered section animations
    const sidebarAnim = useRef(new Animated.Value(0)).current;
    const membershipAnim = useRef(new Animated.Value(0)).current;
    const alertAnim = useRef(new Animated.Value(0)).current;
    const quickInfoAnim = useRef(new Animated.Value(0)).current;
    const randomAnim = useRef(new Animated.Value(0)).current;

    const sidebarSlide = useRef(new Animated.Value(24)).current;
    const membershipSlide = useRef(new Animated.Value(24)).current;
    const alertSlide = useRef(new Animated.Value(24)).current;
    const quickInfoSlide = useRef(new Animated.Value(24)).current;
    const randomSlide = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = await AsyncStorage.getItem('userData');
                if (data) setUserData(JSON.parse(data));
            } catch (error) {
                console.error('Failed to load user data', error);
            } finally {
                // Minimum skeleton display: 800ms for feel
                await new Promise((r) => setTimeout(r, 800));
                triggerTransition();
            }
        };
        loadUserData();
    }, []);

    const triggerTransition = useCallback(() => {
        // 1. Fade out skeleton
        Animated.timing(skeletonOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setIsLoading(false));

        // 2. Fade + slide in content wrapper
        Animated.parallel([
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 350,
                delay: 250,
                useNativeDriver: true,
            }),
            Animated.timing(contentTranslateY, {
                toValue: 0,
                duration: 350,
                delay: 250,
                useNativeDriver: true,
            }),
        ]).start();

        // 3. Stagger each section card
        const makeReveal = (opacAnim, slideAnim, delay) =>
            Animated.parallel([
                Animated.timing(opacAnim, {
                    toValue: 1,
                    duration: 380,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 10,
                    delay,
                    useNativeDriver: true,
                }),
            ]);

        Animated.stagger(90, [
            makeReveal(sidebarAnim, sidebarSlide, 300),
            makeReveal(membershipAnim, membershipSlide, 300),
            makeReveal(alertAnim, alertSlide, 300),
            makeReveal(quickInfoAnim, quickInfoSlide, 300),
            makeReveal(randomAnim, randomSlide, 300),
        ]).start();
    }, []);

    // ── Render Sections ────────────────────────────────────────────────────────

    const renderProfileAlert = () => (
        <Animated.View style={{ opacity: alertAnim, transform: [{ translateY: alertSlide }] }}>
            <View style={styles.alertBox}>
                <Icon name="camera-plus" size={22} color={COLORS.blue} />
                <Text style={styles.alertText}>
                    {t('Upload your')}{' '}
                    <Text style={styles.alertLink}>{t('profile picture')}</Text>{' '}
                    {t('to attract more visitors to your profile.')}
                </Text>
            </View>
        </Animated.View>
    );

    const renderQuickInfo = () => (
        <Animated.View style={[styles.section, { opacity: quickInfoAnim, transform: [{ translateY: quickInfoSlide }] }]}>
            <Text style={styles.sectionTitle}>{t('Quick Info')}</Text>
            <View style={styles.statsGrid}>
                {[
                    { value: '0', label: t('New Messages'), gradient: ['#FF4081', '#FF80AB'], icon: 'message-text' },
                    { value: '0', label: t('Profile Views'), gradient: ['#42A5F5', '#64B5F6'], icon: 'eye' },
                    { value: '0', label: t('Monthly Visitors'), gradient: ['#4CAF50', '#66BB6A'], icon: 'account-group' },
                    { value: '0', label: t('Connect Requests'), gradient: ['#FF4081', '#FF80AB'], icon: 'account-heart' },
                ].map((item, index) => (
                    <TouchableOpacity key={index} activeOpacity={0.8}>
                        <LinearGradient
                            colors={item.gradient}
                            style={styles.statBox}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.statHeader}>
                                <Icon name={item.icon} size={24} color="#FFF" />
                                <Text style={styles.statBoxValue}>{item.value}</Text>
                            </View>
                            <Text style={styles.statBoxLabel}>{item.label}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.View>
    );

    const renderRandomProfiles = () => (
        <Animated.View style={[styles.section, { opacity: randomAnim, transform: [{ translateY: randomSlide }] }]}>
            <Text style={styles.sectionTitle}>{t('Random Profiles')}</Text>
            <View style={styles.premiumLockBox}>
                <Icon name="lock-outline" size={32} color={COLORS.warning} />
                <Text style={styles.lockText}>
                    {t('Validate your email to upgrade to Premium Membership to message and communicate with others.')}
                </Text>
            </View>
        </Animated.View>
    );

    const renderProfileSidebar = () => (
        <Animated.View style={{ opacity: sidebarAnim, transform: [{ translateY: sidebarSlide }] }}>
            <View style={[styles.sidebarCard, { marginBottom: 20 }]}>
                <View style={styles.welcomeHeader}>
                    <Text style={styles.welcomeLabel}>Welcome,</Text>
                    <Text style={styles.sidebarWelcomeText}>{userData?.username || 'User'}</Text>
                    <Text style={styles.profileId}>{userData?.client_id || '...'}</Text>
                </View>
                <TouchableOpacity style={styles.sidebarAvatar}>
                    <Image
                        source={require('../assets/images/avatar_male.png')}
                        style={styles.sidebarAvatarImage}
                    />
                    <View style={styles.uploadBadge}>
                        <Icon name="camera" size={16} color="#FFF" />
                    </View>
                </TouchableOpacity>
                <View style={styles.sidebarLinks}>
                    <TouchableOpacity style={styles.sidebarLinkItem}>
                        <View style={[styles.linkIconBg, { backgroundColor: '#FFE5EF' }]}>
                            <Icon name="image-multiple" size={18} color={COLORS.primary} />
                        </View>
                        <Text style={styles.sidebarLinkText}>{t('View Pictures')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sidebarLinkItem}>
                        <View style={[styles.linkIconBg, { backgroundColor: '#FFE5EF' }]}>
                            <Icon name="heart" size={18} color={COLORS.primary} />
                        </View>
                        <Text style={styles.sidebarLinkText}>{t('Selected Profiles')} (1)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sidebarLinkItem}>
                        <View style={[styles.linkIconBg, { backgroundColor: '#E3F2FD' }]}>
                            <Icon name="zodiac-leo" size={18} color={COLORS.blue} />
                        </View>
                        <Text style={styles.sidebarLinkText}>{t('View Your Horoscope')}</Text>
                    </TouchableOpacity>
                    <View style={styles.sidebarDivider} />
                    <View style={styles.sidebarInfoItem}>
                        <Icon name="eye-outline" size={16} color={COLORS.blue} />
                        <Text style={styles.sidebarInfoText}>{t('Total Views')}</Text>
                        <Text style={styles.sidebarInfoValueInline}>1/50</Text>
                    </View>
                    <View style={styles.sidebarDivider} />
                    <View style={styles.sidebarInfoItem}>
                        <Icon name="calendar-alert" size={16} color={COLORS.danger} />
                        <Text style={styles.sidebarInfoText}>{t('Membership Ends')}</Text>
                        <Text style={[styles.sidebarInfoValueInline, { color: COLORS.danger }]}>09-01-2027</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );

    const renderMembershipInfo = () => (
        <Animated.View style={{ opacity: membershipAnim, transform: [{ translateY: membershipSlide }] }}>
            <View style={styles.membershipSection}>
                <Text style={styles.membershipTitle}>{t('Membership Information')}</Text>
                <View style={styles.membershipCard}>
                    <View style={styles.membershipRow}>
                        <Text style={styles.membershipLabel}>{t('Join Date:')}</Text>
                        <Text style={styles.membershipValue}>09-01-2026</Text>
                    </View>
                    <View style={styles.membershipRow}>
                        <Text style={styles.membershipLabel}>{t('Active Membership plan:')}</Text>
                        <Text style={[styles.membershipValue, { color: COLORS.success }]}>Free</Text>
                    </View>
                    <View style={styles.membershipRow}>
                        <Text style={styles.membershipLabel}>{t('Your Profile Viewers:')}</Text>
                        <Text style={styles.membershipValue}>0</Text>
                    </View>
                    <View style={styles.membershipNote}>
                        <Text style={styles.membershipNoteText}>
                            {t('Your Can able to select only 50 members with this plan. 49 members remaining.')}
                        </Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );

    // ── Skeleton Layer (mounted until fade finishes) ────────────────────────────
    if (isLoading) {
        return <DashboardSkeleton fadeAnim={skeletonOpacity} />;
    }

    // ── Real Content ────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Animated.View
                style={[
                    { flex: 1 },
                    { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
                ]}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mainContent}>
                        <View style={styles.leftColumn}>
                            {renderProfileSidebar()}
                            {renderMembershipInfo()}
                        </View>
                        <View style={styles.rightColumn}>
                            {renderProfileAlert()}
                            {renderQuickInfo()}
                            {renderRandomProfiles()}
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
};

// ─── Skeleton-specific styles ─────────────────────────────────────────────────
const skeletonStyles = StyleSheet.create({
    headerPlaceholder: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        backgroundColor: '#F3C5D5', // muted pink stand-in
        marginBottom: 0,
    },
    statsRowPlaceholder: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
});

// ─── Shared Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollView: { flex: 1 },
    content: { paddingBottom: 30 },

    // Main layout
    mainContent: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 20,
    },
    leftColumn: { width: '100%' },
    rightColumn: { width: '100%' },

    // Alert
    alertBox: {
        backgroundColor: '#E3F2FD',
        borderWidth: 1,
        borderColor: '#90CAF9',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    alertText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
    alertLink: { color: COLORS.blue, fontWeight: '600' },

    // Section
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 15 },

    // Stats grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statBox: {
        width: (width - 60) / 2,
        height: scale(95),
        borderRadius: 20,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 },
    statBoxValue: { fontSize: moderateScale(26), fontWeight: 'bold', color: '#FFF' },
    statBoxLabel: { fontSize: moderateScale(11), color: '#FFF', fontWeight: '700', opacity: 0.95, textAlign: 'center' },

    // Premium lock
    premiumLockBox: {
        backgroundColor: '#FFF9C4',
        borderWidth: 1,
        borderColor: '#FFE082',
        borderRadius: 16,
        padding: 28,
        alignItems: 'center',
    },
    lockText: { fontSize: 14, color: COLORS.textPrimary, textAlign: 'center', marginTop: 12, lineHeight: 20 },

    // Sidebar
    sidebarCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    welcomeHeader: { marginBottom: 20, alignItems: 'center' },
    welcomeLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
    sidebarWelcomeText: { fontSize: moderateScale(18), fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
    profileId: { fontSize: 13, color: COLORS.textTertiary, fontWeight: '500' },
    sidebarAvatar: { alignItems: 'center', marginBottom: 24, position: 'relative' },
    sidebarAvatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primaryLight },
    uploadBadge: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.card,
    },
    sidebarLinks: { gap: 4 },
    sidebarLinkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 },
    linkIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    sidebarLinkText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
    sidebarDivider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 12 },
    sidebarInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
    sidebarInfoText: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
    sidebarInfoValueInline: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 'auto' },

    // Membership
    membershipSection: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    membershipTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
    membershipCard: { gap: 0 },
    membershipRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    membershipLabel: { fontSize: moderateScale(14), color: COLORS.textSecondary },
    membershipValue: { fontSize: moderateScale(14), fontWeight: '600', color: COLORS.textPrimary },
    membershipNote: {
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.danger,
    },
    membershipNoteText: { fontSize: 12, color: COLORS.danger, lineHeight: 18 },
});

export default Dashboard;