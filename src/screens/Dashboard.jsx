import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Skeleton from '../components/Skeleton';
import { scale, moderateScale } from '../utils/responsive';
import { getUserProfile } from '../services/apiService';

const { width } = Dimensions.get('window');

// Pink-White-Green-Blue Palette
const COLORS = {
    primary: '#FF4081',        // Vibrant Pink
    primaryLight: '#FFE5EF',   // Light Pink
    primaryDark: '#E91E63',    // Deep Pink

    background: '#FAFAFA',     // Clean White Background
    card: '#FFFFFF',

    textPrimary: '#2C3E50',    // Dark Blue-Gray
    textSecondary: '#7F8C8D',  // Medium Gray
    textTertiary: '#BDC3C7',   // Light Gray

    success: '#00C853',        // Fresh Green
    warning: '#FFC107',        // Amber
    danger: '#FF1744',         // Red
    info: '#2196F3',           // Blue
    green: '#4CAF50',          // Green
    blue: '#42A5F5',           // Light Blue

    border: '#FFB3D9',         // Soft Pink Border
    divider: '#ECEFF1',        // Light Gray Divider
};

const Dashboard = ({ t }) => {
    console.log("Dashboard Rendering");
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // 1. Get basic session data
                const data = await AsyncStorage.getItem('userData');
                let currentId = null;
                if (data) {
                    const parsed = JSON.parse(data);
                    setUserData(parsed);
                    currentId = parsed.id || parsed.tamil_client_id;
                }

                // 2. Fetch fresh profile data via API
                if (currentId || true) { // fallback/testing
                    const profileResult = await getUserProfile(currentId || '3598');
                    if (profileResult.status && profileResult.data) {
                        console.log('Profile data fetched:', profileResult.data);
                        // Update userData with fresh info from API if needed
                        // For now we just log it as a proof of concept
                    }
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Header with Profile Summary (unchanged)
    const renderHeader = () => (
        <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                    <View style={styles.headerText}>
                        <Text style={styles.greeting}>{t('GOOD_MORNING')}</Text>
                        <Text style={styles.headerName}>{userData?.username || 'User'}</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Icon name="bell-outline" size={24} color="#FFF" />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileSummary}>
                    <View style={styles.avatarRing}>
                        <Image
                            source={require('../assets/images/avatar_male.png')}
                            style={styles.headerAvatar}
                        />
                        <View style={styles.statusIndicator} />
                    </View>

                    <View style={styles.headerStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>1/50</Text>
                            <Text style={styles.statLabel}>{t('VIEWS')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>Free</Text>
                            <Text style={styles.statLabel}>{t('PLAN')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: '#FFEB3B' }]}>85%</Text>
                            <Text style={styles.statLabel}>{t('COMPLETE')}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );

    // Profile Upload Alert
    const renderProfileAlert = () => (
        <View style={styles.alertBox}>
            <Icon name="camera-plus" size={22} color={COLORS.blue} />
            <Text style={styles.alertText}>
                {t('Upload your')} <Text style={styles.alertLink}>{t('profile picture')}</Text> {t('to attract more visitors to your profile.')}
            </Text>
        </View>
    );

    // Quick Info Stats Cards
    const renderQuickInfo = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('QUICK_INFO') || 'முக்கிய விபரங்கள்'}</Text>
            <View style={styles.statsGrid}>
                {[
                    { value: '0', label: t('New Messages'), gradient: ['#FF4081', '#FF80AB'], icon: 'message-text' },
                    { value: '0', label: t('Profile Views'), gradient: ['#42A5F5', '#64B5F6'], icon: 'eye' },
                    { value: '0', label: t('Monthly Visitors'), gradient: ['#4CAF50', '#66BB6A'], icon: 'account-group' },
                    { value: '0', label: t('Connect Requests'), gradient: ['#FF4081', '#FF80AB'], icon: 'account-heart' },
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        style={styles.statBoxWrapper}
                    >
                        <LinearGradient
                            colors={item.gradient}
                            style={styles.statBox}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.statHeader}>
                                <Icon name={item.icon} size={scale(24)} color="#FFF" />
                                <Text style={styles.statBoxValue}>{item.value}</Text>
                            </View>
                            <Text style={styles.statBoxLabel} numberOfLines={1}>{item.label}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // Random Profiles Section (Premium Lock)
    const renderRandomProfiles = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { marginBottom: 0, flex: 1 }]}>{t('OTHER_PROFILES')}</Text>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.upgradeLinkText}>{t('UPGRADE')}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.premiumLockBox}>
                <Icon name="lock-outline" size={32} color={COLORS.warning} />
                <Text style={styles.lockText}>
                    {t('VERIFY_EMAIL')}
                </Text>
                <TouchableOpacity style={styles.upgradeBtnWide}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.upgradeGradient}
                    >
                        <Text style={styles.upgradeText}>{t('GET_MORE_PROFILES')}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Profile Sidebar Info
    const renderProfileSidebar = () => (
        <View style={styles.sidebarCard}>
            <View style={styles.welcomeHeader}>
                <Text style={styles.welcomeLabel}>{t('WELCOME') || 'வரவேற்கிறோம்'},</Text>
                <Text style={styles.sidebarWelcomeText}>{userData?.username || t('USER') || 'பயனர்'}</Text>
                <Text style={styles.profileId}>{userData?.profile_id || userData?.client_id || '...'}</Text>
            </View>

            <TouchableOpacity style={styles.sidebarAvatar}>
                <View style={styles.avatarShadow}>
                    <Image
                        source={require('../assets/images/avatar_male.png')}
                        style={styles.sidebarAvatarImage}
                    />
                    <View style={styles.uploadBadge}>
                        <Icon name="camera" size={scale(16)} color="#FFF" />
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.sidebarLinks}>
                <TouchableOpacity style={styles.sidebarLinkItem}>
                    <View style={[styles.linkIconBg, { backgroundColor: '#FFEEF6' }]}>
                        <Icon name="image-multiple" size={scale(18)} color={COLORS.primary} />
                    </View>
                    <Text style={styles.sidebarLinkText}>{t('VIEW_PICTURES') || 'படங்களைப் பார்க்க'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarLinkItem}>
                    <View style={[styles.linkIconBg, { backgroundColor: '#FFEEF6' }]}>
                        <Icon name="heart" size={scale(18)} color={COLORS.primary} />
                    </View>
                    <Text style={styles.sidebarLinkText}>{t('SELECTED_PROFILES') || 'தேர்ந்தெடுக்கப்பட்டவை'} (1)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarLinkItem}>
                    <View style={[styles.linkIconBg, { backgroundColor: '#E3F2FD' }]}>
                        <Icon name="zodiac-leo" size={scale(18)} color={COLORS.info} />
                    </View>
                    <Text style={styles.sidebarLinkText}>{t('VIEW_HOROSCOPE') || 'ஜாதகத்தைப் பார்க்க'}</Text>
                </TouchableOpacity>

                <View style={styles.sidebarDivider} />

                <View style={styles.sidebarInfoItem}>
                    <Icon name="eye-outline" size={scale(16)} color={COLORS.info} />
                    <Text style={styles.sidebarInfoText}>{t('TOTAL_VIEWS') || 'மொத்த பார்வைகள்'}</Text>
                    <Text style={styles.sidebarInfoValueInline}>1/50</Text>
                </View>

                <View style={styles.sidebarDivider} />

                <View style={styles.sidebarInfoItem}>
                    <Icon name="calendar-alert" size={scale(16)} color={COLORS.danger} />
                    <Text style={styles.sidebarInfoText}>{t('MEMBERSHIP_ENDS') || 'சந்தா முடிவடையும் நாள்'}</Text>
                    <Text style={[styles.sidebarInfoValueInline, { color: COLORS.danger }]}>09-01-2027</Text>
                </View>
            </View>
        </View>
    );

    // Membership Section - Re-designed as a Premium VIP Card
    const renderMembershipInfo = () => (
        <View style={styles.section}>
            <LinearGradient
                colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumCard}
            >
                <View style={styles.premiumHeader}>
                    <View>
                        <Text style={styles.premiumLabel}>{t('ACTIVE_PLAN')}</Text>
                        <Text style={styles.premiumValue}>{t('FREE')}</Text>
                    </View>
                    <Icon name="crown" size={40} color="#FFD700" />
                </View>

                <View style={styles.planProgressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>{t('PLAN_WARNING')}</Text>
                        <Text style={styles.progressPercent}>1/50</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '2%' }]} />
                    </View>
                </View>

                <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>{t('GET_MORE_PROFILES')}:</Text>
                    <View style={styles.benefitRow}>
                        <Icon name="check-decagram" size={16} color="#FFF" />
                        <Text style={styles.benefitText}>{t('UNLIMITED_PROFILES')}</Text>
                    </View>
                    <View style={styles.benefitRow}>
                        <Icon name="check-decagram" size={16} color="#FFF" />
                        <Text style={styles.benefitText}>{t('CONTACT_UNLIMITED')}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.upgradeBtnMain}>
                    <Text style={styles.upgradeBtnTextMain}>{t('UPGRADE')}</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    if (isLoading) {
        return <Skeleton type="Dashboard" />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.mainContent}>
                    {renderProfileSidebar()}
                    {renderMembershipInfo()}
                    {renderQuickInfo()}
                    {renderProfileAlert()}
                    {renderRandomProfiles()}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 30,
    },

    // Header (unchanged)
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerText: {
        flex: 1,
    },
    greeting: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        marginBottom: 4,
    },
    headerName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFEB3B',
    },
    profileSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    avatarRing: {
        position: 'relative',
    },
    headerAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.success,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerStats: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingVertical: 12,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },

    // Main Content Layout
    mainContent: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 20,
    },
    leftColumn: {
        width: '100%',
    },
    rightColumn: {
        width: '100%',
    },

    // Alert Box
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
    alertText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    alertLink: {
        color: COLORS.blue,
        fontWeight: '600',
    },

    // Section
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 15,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: scale(12),
    },
    statBoxWrapper: {
        width: '48%',
    },
    statBox: {
        width: '100%',
        height: scale(95),
        borderRadius: scale(16),
        padding: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(3) },
        shadowOpacity: 0.1,
        shadowRadius: scale(6),
        elevation: scale(3),
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        marginBottom: scale(4),
    },
    statBoxValue: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#FFF',
    },
    statBoxLabel: {
        fontSize: moderateScale(11),
        color: '#FFF',
        fontWeight: '700',
        opacity: 0.95,
        textAlign: 'center',
        marginTop: scale(2),
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(15),
        gap: scale(10),
    },
    upgradeLinkText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: moderateScale(12),
        textDecorationLine: 'underline',
    },

    // Premium Lock Box
    premiumLockBox: {
        backgroundColor: '#FFF9C4',
        borderWidth: 1,
        borderColor: '#FFE082',
        borderRadius: 16,
        padding: 28,
        alignItems: 'center',
    },
    lockText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },

    // Sidebar Card
    sidebarCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    welcomeHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    welcomeLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    sidebarWelcomeText: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    profileId: {
        fontSize: 13,
        color: COLORS.textTertiary,
        fontWeight: '500',
    },
    sidebarAvatar: {
        alignItems: 'center',
        marginBottom: scale(20),
    },
    avatarShadow: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        backgroundColor: '#FFF',
        elevation: scale(8),
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: scale(4) },
        shadowOpacity: 0.2,
        shadowRadius: scale(10),
        position: 'relative',
    },
    sidebarAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: scale(50),
        borderWidth: scale(3),
        borderColor: '#FFF',
    },
    uploadBadge: {
        position: 'absolute',
        bottom: scale(2),
        right: scale(2),
        backgroundColor: COLORS.primary,
        width: scale(30),
        height: scale(30),
        borderRadius: scale(15),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: scale(2),
        borderColor: '#FFF',
    },
    sidebarLinks: {
        gap: 4,
    },
    sidebarLinkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    linkIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sidebarLinkText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    sidebarDivider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginVertical: 12,
    },
    sidebarInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    sidebarInfoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    sidebarInfoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 24,
        marginTop: 4,
    },
    sidebarInfoValueInline: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 'auto',
    },

    // Membership Section
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
    membershipTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    membershipCard: {
        gap: 0,
    },
    membershipRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    membershipLabel: {
        fontSize: moderateScale(14),
        color: COLORS.textSecondary,
    },
    membershipValue: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    membershipNote: {
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.danger,
    },
    membershipNoteText: {
        fontSize: 12,
        color: COLORS.danger,
        lineHeight: 18,
    },

    // Premium Card Styles
    premiumCard: {
        borderRadius: 24,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        marginBottom: 10,
    },
    premiumHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    premiumLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    premiumValue: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    planProgressContainer: {
        marginBottom: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '500',
        flex: 1,
        marginRight: 10,
    },
    progressPercent: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFD700',
    },
    benefitsContainer: {
        marginBottom: 24,
    },
    benefitsTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    benefitText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '500',
    },
    upgradeBtnMain: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    upgradeBtnTextMain: {
        color: '#1a2a6c',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Other styles preserved/cleaned
    upgradeBtnWide: {
        marginTop: 15,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    upgradeGradient: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    upgradeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default Dashboard;