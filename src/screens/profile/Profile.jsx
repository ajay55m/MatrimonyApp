import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    Animated,
    StatusBar,
    ImageBackground,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getLabel, EDUCATION_MAP, OCCUPATION_MAP, RELIGION_MAP, CASTE_MAP, LOCATION_MAP } from '../../utils/dataMappings';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { scale, moderateScale, width } from '../../utils/responsive';

// Components
import Footer from '../../components/Footer';
import SidebarMenu from '../../components/SidebarMenu';
import Skeleton from '../../components/Skeleton';
import { getSelectedProfiles } from '../../services/profileService';


// Translations
import { TRANSLATIONS } from '../../constants/translations';

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Login State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fixed Tamil Language
    const lang = 'ta';
    const t = (key) => TRANSLATIONS[lang][key] || key;

    const route = useRoute();



    const fetchProfiles = async () => {
        try {
            setIsLoading(true);
            const data = await AsyncStorage.getItem('userData');
            if (data) {
                const user = JSON.parse(data);
                const result = await getSelectedProfiles(user.tamil_client_id || user.client_id || user.profileid);
                if (result.status && result.data) {
                    setProfiles(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching selected profiles:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const checkLoginStatus = async () => {
        try {
            const session = await AsyncStorage.getItem('userSession');
            const loggedIn = session === 'true';
            setIsLoggedIn(loggedIn);
            return loggedIn;
        } catch (e) {
            console.error('Failed to load session', e);
            return false;
        }
    };


    const [profiles, setProfiles] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            const initialize = async () => {
                const loggedIn = await checkLoginStatus();
                const { searchResults, isSearch } = route.params || {};

                if (isSearch && searchResults) {
                    setProfiles(searchResults);
                    setIsLoading(false);
                } else if (loggedIn) {
                    fetchProfiles();
                } else {
                    setIsLoading(false);
                }
            };
            initialize();
        }, [route.params])
    );


    const handleFooterNavigation = (tab) => {
        if (tab === 'HOME') {
            navigation.navigate('Main', { initialTab: 'HOME' });
        } else if (tab === 'CONTACT') {
            navigation.navigate('Contact');
        } else if (tab === 'SEARCH') {
            navigation.navigate('Search');
        } else if (tab === 'PROFILE') {
            // Already here
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userSession');
            await AsyncStorage.removeItem('userData');
            setIsLoggedIn(false);
            setMenuVisible(false); // Close menu
            navigation.navigate('Main');
        } catch (e) {
            console.error('Logout error', e);
        }
    };

    const renderProfileCard = (profile, index) => {
        // Handle API data mapping
        const profileId = profile.profile_id || profile.id;
        // Logic for "Recent" vs "Online" - mimicking the target design which shows "Recent" often
        const lastActiveText = profile.lastActive || 'Recent';
        const isRecent = lastActiveText === 'Recent';

        // Map fields using helper
        const educationRaw = Array.isArray(profile.education) ? profile.education[0] : (profile.education || '');
        const educationLabel = getLabel(EDUCATION_MAP, educationRaw);

        const occupationRaw = profile.occupation || profile.profession || '';
        const occupationLabel = getLabel(OCCUPATION_MAP, occupationRaw);

        const religionLabel = getLabel(RELIGION_MAP, profile.religion);
        // Ensure Caste is shown
        const casteLabel = getLabel(CASTE_MAP, profile.caste) || profile.caste || 'Nadar';

        // Location Construction
        const district = getLabel(LOCATION_MAP, profile.district);
        const city = getLabel(LOCATION_MAP, profile.city);
        const locationParts = [city, district].filter(p => p && p !== '0' && p !== '1' && p !== 'Unknown');
        // Prioritize specific backend location (which may be Tamil) if available, otherwise fallback to reconstruction
        const locationLabel = (profile.location && profile.location !== 'Unknown')
            ? profile.location
            : (locationParts.length > 0 ? locationParts.join(', ') : 'Tamil Nadu');

        // Height Construction
        let heightLabel = '5ft 5in'; // Default/Fallback
        if (profile.height) {
            if (!isNaN(profile.height) && parseInt(profile.height) > 100) {
                heightLabel = `${profile.height} cm`;
            } else {
                heightLabel = profile.height;
            }
        }

        return (
            <View key={profileId} style={styles.cardWrapper}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ProfileDetails', { profile })}
                >
                    <View style={styles.profileCard}>
                        {/* Header: ID (Left) | Status (Right) */}
                        <View style={styles.cardHeader}>
                            <View style={styles.profileBadge}>
                                {/* Icon removed to match target design */}
                                <Text style={styles.profileIdText}>{profileId}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <View style={[styles.statusDot, { backgroundColor: '#F57C00' }]} />
                                <Text style={styles.statusText}>{lastActiveText}</Text>
                            </View>
                        </View>

                        {/* Main Content */}
                        <View style={styles.cardBody}>
                            {/* Left: Avatar + Stacked Badges */}
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarOuterRing}>
                                    {/* Use a simple container for the image/icon, border handled by OuterRing */}
                                    <View style={styles.avatarInner}>
                                        {profile.profile_image ? (
                                            <Image
                                                source={{ uri: profile.profile_image }}
                                                style={styles.avatar}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <LinearGradient
                                                colors={['#64B5F6', '#1976D2']} // Blue gradient for no-avatar
                                                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                                            >
                                                <Icon name="account" size={scale(35)} color="#FFFFFF" />
                                            </LinearGradient>
                                        )}
                                    </View>
                                </View>

                                {/* Stacked Badges below Avatar */}
                                <View style={styles.matchScoreContainer}>
                                    <View style={styles.verifiedBadgeSmall}>
                                        <Icon name="check-circle" size={scale(11)} color="#2E7D32" />
                                        <Text style={styles.badgeLabelSmall}>Viewed</Text>
                                    </View>
                                    <View style={styles.horoscopeBadgeSmall}>
                                        <Icon name="camera" size={scale(11)} color="#EF6C00" />
                                        <Text style={styles.badgeLabelSmall}>Photo Req</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Right: Info Area */}
                            <View style={styles.infoContainer}>
                                {/* Name and Age Row */}
                                <View style={styles.nameRow}>
                                    <Text style={styles.name} numberOfLines={2}>{profile.name}</Text>
                                    <View style={styles.ageBadge}>
                                        <Text style={styles.ageText}>{profile.age} Yrs</Text>
                                    </View>
                                </View>

                                {/* Details Grid - 2 columns */}
                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailCol}>
                                        <View style={styles.detail}>
                                            <Icon name="human-male-height" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText}>{heightLabel}</Text>
                                        </View>
                                        <View style={styles.detail}>
                                            <Icon name="om" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText}>{religionLabel}</Text>
                                        </View>
                                        <View style={styles.detail}>
                                            <Icon name="account-group" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText}>{casteLabel}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailCol}>
                                        <View style={styles.detail}>
                                            <Icon name="map-marker" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText} numberOfLines={1}>{locationLabel}</Text>
                                        </View>
                                        <View style={styles.detail}>
                                            <Icon name="school" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText} numberOfLines={1}>{educationLabel}</Text>
                                        </View>
                                        <View style={styles.detail}>
                                            <Icon name="briefcase" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText} numberOfLines={1}>{occupationLabel}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Register Button - Only if requested, but current feedback suggests 'incomplete design' implies missing details/layout */}
                                {/* We keep it minimal or remove if not in target. I will keep it but make it match the card width if needed. */}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Header Spacer for Status Bar to avoid overlap */}
            <View style={{ height: insets.top + scale(10) }} />

            <View style={styles.header}>
                {/* Visual Balancer Removed for Left Alignment */}

                <View style={styles.titleBadgeContainer}>
                    <LinearGradient
                        colors={['#ef0d8d', '#ad0761']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.titleBadge}
                    >
                        <Icon name="account-multiple" size={scale(18)} color="#FFFFFF" />
                        <Text style={styles.headerTitle}>{t('MATCHES')}</Text>
                    </LinearGradient>
                </View>

                {/* Right Side Actions - Avatar/Menu */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10) }}>
                    {isLoggedIn && (
                        <TouchableOpacity onPress={() => navigation.navigate('Main', { initialTab: 'HOME' })}>
                            <Image
                                source={require('../../assets/images/avatar_male.png')}
                                style={{ width: scale(35), height: scale(35), borderRadius: scale(17.5), borderWidth: scale(1.5), borderColor: '#fff' }}
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <Icon name="menu" size={scale(28)} color="#ad0761" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <Skeleton type="Profile" />
            ) : (
                <>
                    {/* List */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.statsRow}>
                            <Text style={styles.statsText}>Showing {profiles.length} Profiles</Text>
                            <TouchableOpacity style={styles.sortBtn}>
                                <Text style={styles.sortText}>Sort by Match</Text>
                                <Icon name="chevron-down" size={scale(16)} color="#ef0d8d" />
                            </TouchableOpacity>
                        </View>

                        {profiles.map((profile, index) => renderProfileCard(profile, index))}

                        <TouchableOpacity style={styles.loadMore}>
                            <Text style={styles.loadMoreText}>Load More profiles</Text>
                            <Icon name="refresh" size={scale(18)} color="#ef0d8d" />
                        </TouchableOpacity>
                    </ScrollView>
                </>
            )}

            {/* Footer */}
            <View style={styles.footerWrapper}>
                <Footer
                    activeTab="PROFILE"
                    setActiveTab={handleFooterNavigation}
                    t={t}
                />
            </View>

            {/* Sidebar Menu */}
            <SidebarMenu
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                t={t}
                navigation={navigation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7ED', // Dashboard Background Color
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(15),
        paddingBottom: scale(10),
        paddingTop: scale(10), // Added explicit top padding since we removed ImageBackground
    },
    backBtn: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: 'rgba(0,0,0,0.05)', // Softer background on light theme
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: scale(1),
        marginLeft: scale(8),
    },
    titleBadgeContainer: {
        // Removed flex/center to align left
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(8),
        borderRadius: scale(25),
        elevation: scale(6),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(3) },
        shadowOpacity: 0.25,
        shadowRadius: scale(5),
        borderWidth: scale(1),
        borderColor: 'rgba(255,255,255,0.2)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: scale(14),
        paddingTop: scale(5),
        paddingBottom: scale(20),
    },
    footerWrapper: {
        marginBottom: scale(0),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(14),
        paddingHorizontal: scale(4),
    },
    statsText: {
        fontSize: moderateScale(14),
        color: '#444',
        fontWeight: '600',
        backgroundColor: 'rgba(255,165,0,0.1)', // Light orange tint to match theme
        paddingHorizontal: scale(8),
        paddingVertical: scale(2),
        borderRadius: scale(4),
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: scale(8),
        paddingVertical: scale(2),
        borderRadius: scale(4),
        borderWidth: scale(1),
        borderColor: 'rgba(0,0,0,0.05)',
    },
    sortText: {
        fontSize: moderateScale(13),
        color: '#ef0d8d',
        fontWeight: '600',
    },
    cardWrapper: {
        marginBottom: scale(14),
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        overflow: 'hidden',
        borderWidth: scale(1),
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: scale(4) },
                shadowOpacity: 0.1,
                shadowRadius: scale(8),
            },
            android: {
                elevation: scale(4),
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // Clean white header
        paddingHorizontal: scale(14),
        paddingVertical: scale(8),
        borderBottomWidth: 0, // Removed separator line
    },
    profileBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },
    profileIdText: {
        fontSize: moderateScale(14),
        color: '#1565C0', // Strong Blue ID
        fontWeight: '700',
        letterSpacing: scale(0.2),
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0', // Soft Orange BG
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        gap: scale(5),
    },
    statusDot: {
        width: scale(6),
        height: scale(6),
        borderRadius: scale(3),
        backgroundColor: '#FF9800', // Orange Dot
    },
    statusText: {
        fontSize: moderateScale(11),
        color: '#EF6C00', // Deep Orange Text
        fontWeight: '700',
    },
    cardBody: {
        flexDirection: 'row',
        padding: scale(14),
        paddingTop: 0, // Reduce top padding from header
    },
    avatarContainer: {
        alignItems: 'center',
        marginRight: scale(14),
    },
    avatarOuterRing: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        borderWidth: scale(3), // Thicker ring
        borderColor: '#FFC107', // Golden Ring
        padding: scale(4),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(8),
        elevation: scale(0), // Flat design
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: scale(36),
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: scale(36),
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockIconContainer: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(2),
        elevation: scale(2),
    },
    viewTextSmall: {
        fontSize: moderateScale(8),
        fontWeight: 'bold',
        color: '#000',
        textShadowColor: 'rgba(255,255,255,1)',
        textShadowRadius: scale(4),
        textAlign: 'center',
    },
    matchScoreContainer: {
        alignItems: 'center',
        gap: scale(5),
        marginTop: scale(2),
    },
    verifiedBadgeSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: scale(8),
        paddingVertical: scale(3),
        borderRadius: scale(4),
        gap: scale(4),
        minWidth: scale(70),
        justifyContent: 'center',
        borderWidth: 0,
    },
    horoscopeBadgeSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: scale(8),
        paddingVertical: scale(3),
        borderRadius: scale(4),
        gap: scale(4),
        minWidth: scale(70),
        justifyContent: 'center',
        borderWidth: 0,
    },
    badgeLabelSmall: {
        fontSize: moderateScale(10),
        fontWeight: '600',
        color: '#333',
    },
    badgesPlaceholder: {
        flex: 1,
    },
    infoContainer: {
        flex: 1,
        paddingTop: scale(4),
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center', // Center align name and badge
        justifyContent: 'flex-start', // Left align
        marginBottom: scale(12),
        gap: scale(8),
    },
    name: {
        fontSize: moderateScale(18), // Larger Name
        fontWeight: '700',
        color: '#000000',
        flexShrink: 1, // Allow text wrapping if needed
        lineHeight: moderateScale(24),
        fontFamily: 'NotoSansTamil-Bold',
    },
    ageBadge: {
        backgroundColor: '#FCE4EC', // Pink Badge
        paddingHorizontal: scale(8),
        paddingVertical: scale(2),
        borderRadius: scale(4),
        borderWidth: 0,
    },
    ageText: {
        fontSize: moderateScale(12),
        fontWeight: '700',
        color: '#EC407A', // Pink Text
    },
    detailsGrid: {
        flexDirection: 'row',
        marginBottom: scale(12),
        gap: scale(10),
        backgroundColor: '#F9FAFB',
        padding: scale(10),
        borderRadius: scale(12),
    },
    detailCol: {
        flex: 1,
        gap: scale(7),
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(7),
    },
    detailText: {
        fontSize: moderateScale(12),
        color: '#4B5563',
        fontWeight: '500',
        flex: 1,
        lineHeight: moderateScale(18),
        fontFamily: 'NotoSansTamil-Regular',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: scale(8),
    },
    connectBtn: {
        borderRadius: scale(20),
        overflow: 'hidden',
        width: '100%',
    },
    connectGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(12),
        gap: scale(8),
    },
    connectText: {
        color: '#FFFFFF',
        fontSize: moderateScale(14),
        fontWeight: '700',
        letterSpacing: scale(0.5),
    },
    loadMore: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingVertical: scale(14),
        borderRadius: scale(24),
        marginBottom: scale(10),
        gap: scale(6),
        borderWidth: scale(1),
        borderColor: '#fbc9e5',
        shadowColor: '#ef0d8d',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
        elevation: scale(2),
    },
    loadMoreText: {
        color: '#ad0761',
        fontSize: moderateScale(14),
        fontWeight: '700',
    },
});

export default ProfileScreen;