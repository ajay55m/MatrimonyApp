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
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Skeleton from '../components/Skeleton';
import { scale, moderateScale } from '../utils/responsive';
import { decodeUTF8String, logUTF8String } from '../utils/utf8Helper';
import { getProfile, getDashboardStats } from '../services/profileService';

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
        const loadUserData = async () => {
            try {
                const data = await AsyncStorage.getItem('userData');
                if (data) {
                    const parsedData = JSON.parse(data);

                    // Debug: Check what's coming from storage
                    console.log("Raw user_name from storage:", parsedData.user_name);
                    logUTF8String("Storage user_name", parsedData.user_name);

                    setUserData(parsedData);

                    // Fetch fresh profile data
                    const idToFetch = parsedData.m_id;

                    if (idToFetch) {
                        try {
                            const profileResult = await getProfile(idToFetch);

                            // Debug: Check what's coming from API
                            console.log("Profile API Response:", JSON.stringify(profileResult, null, 2));

                            if (profileResult && profileResult.status && profileResult.data) {
                                const liveProfile = profileResult.data.main_profile;

                                // Debug: Check the name specifically
                                console.log("Live user_name from API:", liveProfile?.user_name);
                                logUTF8String("API user_name", liveProfile?.user_name);

                                let statsData = {};
                                try {
                                    const statsResult = await getDashboardStats(idToFetch);
                                    if (statsResult && statsResult.status && statsResult.data) {
                                        statsData = statsResult.data;
                                    }
                                } catch (statsErr) {
                                    console.log("Failed to fetch dashboard stats", statsErr);
                                }

                                if (liveProfile) {
                                    const updatedData = {
                                        ...parsedData,
                                        ...liveProfile,
                                        ...statsData,
                                        user_name: liveProfile.user_name || parsedData.user_name,
                                    };

                                    // Debug final merged data
                                    console.log("Final user_name:", updatedData.user_name);
                                    logUTF8String("Final user_name", updatedData.user_name);

                                    setUserData(updatedData);

                                    // Store back to AsyncStorage
                                    await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
                                }
                            }
                        } catch (fetchErr) {
                            console.log("Background profile fetch failed", fetchErr);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load user data', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    // Function to safely display text with fallback
    const displayName = () => {
        const name = userData?.user_name || userData?.name || userData?.username || 'User';
        // If we see question marks, log the actual value
        if (name && name.includes('?')) {
            console.log("Name contains question marks:", name);
            logUTF8String("Problematic name", name);
        }
        return name;
    };

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
                        <Text style={styles.headerName}>
                            {displayName()}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Icon name="bell-outline" size={24} color="#FFF" />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileSummary}>
                    <View style={styles.avatarRing}>
                        <Image
                            source={
                                userData?.user_photo
                                    ? { uri: `https://nadarmahamai.com/uploads/${userData.user_photo}` }
                                    : (userData?.photo_data1
                                        ? { uri: `https://nadarmahamai.com/uploads/${userData.photo_data1}` }
                                        : require('../assets/images/avatar_male.png'))
                            }
                            style={styles.headerAvatar}
                            resizeMode="cover"
                        />
                        <View style={styles.statusIndicator} />
                    </View>

                    <View style={styles.headerStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{userData?.viewed_profiles || '0'}/{userData?.views_limit || '50'}</Text>
                            <Text style={styles.statLabel}>{t('VIEWS')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{userData?.mem_plan === '0' ? 'Free' : (userData?.plan_name || 'Premium')}</Text>
                            <Text style={styles.statLabel}>{t('PLAN')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: '#FFEB3B' }]}>{userData?.profile_completeness || '0'}%</Text>
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
            <Text style={styles.sectionTitle}>{t('Quick Info')}</Text>
            <View style={styles.statsGrid}>
                {[
                    { value: userData?.user_points || '0', label: t('Points'), gradient: ['#FF4081', '#FF80AB'], icon: 'star-circle' },
                    { value: userData?.viewed_profiles || '0', label: t('Profile Views'), gradient: ['#42A5F5', '#64B5F6'], icon: 'eye' },
                    { value: userData?.no_sel_profiles || '0', label: t('Selected Profiles'), gradient: ['#4CAF50', '#66BB6A'], icon: 'heart-multiple' },
                    { value: userData?.connect_requests || '0', label: t('Connect Requests'), gradient: ['#FF4081', '#FF80AB'], icon: 'account-heart' },
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                    >
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
        </View>
    );

    // Random Profiles Section (Premium Lock)
    const renderRandomProfiles = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Random Profiles')}</Text>
            <View style={styles.premiumLockBox}>
                <Icon name="lock-outline" size={32} color={COLORS.warning} />
                <Text style={styles.lockText}>
                    {t('Validate your email to upgrade to Premium Membership to message and communicate with others.')}
                </Text>
            </View>
        </View>
    );

    // Profile Sidebar Info
    const renderProfileSidebar = () => (
        <View style={styles.sidebarCard}>
            <View style={styles.welcomeHeader}>
                <Text style={styles.welcomeLabel}>Welcome,</Text>
                <Text style={styles.sidebarWelcomeText}>
                    {displayName()}
                </Text>
                <Text style={styles.profileId}>{userData?.client_id || '...'}</Text>
            </View>

            <TouchableOpacity style={styles.sidebarAvatar}>
                <Image
                    source={
                        userData?.user_photo
                            ? { uri: `https://nadarmahamai.com/uploads/${userData.user_photo}` }
                            : (userData?.photo_data1
                                ? { uri: `https://nadarmahamai.com/uploads/${userData.photo_data1}` }
                                : require('../assets/images/avatar_male.png'))
                    }
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
                    <Text style={styles.sidebarLinkText}>{t('Selected Profiles')} ({userData?.no_sel_profiles || '0'})</Text>
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
                    <Text style={styles.sidebarInfoValueInline}>{userData?.viewed_profiles || '0'}/50</Text>
                </View>

                <View style={styles.sidebarDivider} />

                <View style={styles.sidebarInfoItem}>
                    <Icon name="calendar-alert" size={16} color={COLORS.danger} />
                    <Text style={styles.sidebarInfoText}>{t('Membership Ends')}</Text>
                    <Text style={[styles.sidebarInfoValueInline, { color: COLORS.danger }]}>{userData?.mem_end_date || '09-01-2027'}</Text>
                </View>
            </View>
        </View>
    );

    // Membership Information Section
    const renderMembershipInfo = () => (
        <View style={styles.membershipSection}>
            <Text style={styles.membershipTitle}>{t('Membership Information')}</Text>
            <View style={styles.membershipCard}>
                <View style={styles.membershipRow}>
                    <Text style={styles.membershipLabel}>{t('Join Date:')}</Text>
                    <Text style={styles.membershipValue}>{userData?.reg_date || '0000-00-00'}</Text>
                </View>
                <View style={styles.membershipRow}>
                    <Text style={styles.membershipLabel}>{t('Active Membership plan:')}</Text>
                    <Text style={[styles.membershipValue, { color: COLORS.success }]}>{userData?.mem_plan === '0' ? 'Free' : 'Premium'}</Text>
                </View>
                <View style={styles.membershipRow}>
                    <Text style={styles.membershipLabel}>{t('Your Profile Viewers:')}</Text>
                    <Text style={styles.membershipValue}>{userData?.profile_visitors || '0'}</Text>
                </View>
                <View style={styles.membershipNote}>
                    <Text style={styles.membershipNoteText}>
                        {t('Your Can able to select only 50 members with this plan. 49 members remaining.')}
                    </Text>
                </View>
            </View>
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
                {/* {renderHeader()} */}

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
        </View>
    );
};

// Font Constant
const TAMIL_FONT = 'NotoSansTamil-Regular';

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
        fontFamily: 'NotoSansTamil-Bold',
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
        fontFamily: TAMIL_FONT,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statBox: {
        width: (width - 60) / 2, // Slightly more breathing room
        height: scale(95),
        borderRadius: 20,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center', // Center everything
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 6,
    },
    statBoxValue: {
        fontSize: moderateScale(26),
        fontWeight: 'bold',
        color: '#FFF',
    },
    statBoxLabel: {
        fontSize: moderateScale(11),
        color: '#FFF',
        fontWeight: '700',
        opacity: 0.95,
        textAlign: 'center',
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
        fontFamily: 'NotoSansTamil-Bold',
    },
    profileId: {
        fontSize: 13,
        color: COLORS.textTertiary,
        fontWeight: '500',
    },
    sidebarAvatar: {
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    sidebarAvatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: COLORS.primaryLight,
    },
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
        fontFamily: TAMIL_FONT,
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
        fontFamily: TAMIL_FONT,
    },
    sidebarInfoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 24,
        marginTop: 4,
        fontFamily: TAMIL_FONT,
    },
    sidebarInfoValueInline: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 'auto',
        fontFamily: TAMIL_FONT,
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
        fontFamily: TAMIL_FONT,
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
        fontFamily: TAMIL_FONT,
    },
    membershipValue: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: COLORS.textPrimary,
        fontFamily: TAMIL_FONT,
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
});

export default Dashboard;