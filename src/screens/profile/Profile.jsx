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
import { useNavigation } from '@react-navigation/native';
import { scale, moderateScale, width } from '../../utils/responsive';

// Components
import Footer from '../../components/Footer';
import SidebarMenu from '../../components/SidebarMenu';
import Skeleton from '../../components/Skeleton';

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

    useEffect(() => {
        checkLoginStatus();
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const checkLoginStatus = async () => {
        try {
            const session = await AsyncStorage.getItem('userSession');
            setIsLoggedIn(session === 'true');
        } catch (e) {
            console.error('Failed to load session', e);
        }
    };

    const [profiles] = useState([
        {
            id: 'NADARM1000394',
            name: 'D.ராம் மனோகர் காவல்கர்',
            age: '29',
            height: '5\'9"',
            religion: 'Hindu',
            caste: 'நாடார்',
            location: 'சுலூர்ப்பேரி',
            education: 'Master Degree',
            profession: 'Private Sector',
            verified: true,
            horoscope: true,
            compatibility: '89',
            lastActive: '2h ago',
            avatarColor: ['#f3f4f7ff', '#2C73D2'],
        },
        {
            id: 'NADARM1000534',
            name: 'C.ராஜகுமார்',
            age: '30',
            height: '5\'9"',
            religion: 'Hindu',
            caste: 'நாடார்',
            location: 'புதியமுத்தூர்',
            education: 'Bachelor Degree',
            profession: 'Business Owner',
            verified: true,
            horoscope: true,
            compatibility: '92',
            lastActive: '1d ago',
            avatarColor: ['#E74C5C', '#D32F2F'],
        },
        {
            id: 'NADARM1000683',
            name: 'S.சேகர்',
            age: '28',
            height: '5\'8"',
            religion: 'Hindu',
            caste: 'நாடார்',
            location: 'சேலம்',
            education: 'B.E Computer Science',
            profession: 'Software Engineer',
            verified: true,
            horoscope: true,
            compatibility: '95',
            lastActive: 'Online',
            avatarColor: ['#4CAF50', '#388E3C'],
        },
    ]);

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
        return (
            <View key={profile.id} style={styles.cardWrapper}>
                <View style={styles.profileCard}>
                    {/* Simple Header with Badge */}
                    <View style={styles.cardHeader}>
                        <View style={styles.profileBadge}>
                            <Icon name="account-circle" size={scale(16)} color="#2d3031ff" />
                            <Text style={styles.profileIdText}>{profile.id}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: profile.lastActive === 'Online' ? '#4CAF50' : '#FF9800' }]} />
                            <Text style={[styles.statusText, { color: profile.lastActive === 'Online' ? '#2E7D32' : '#E65100' }]}>{profile.lastActive}</Text>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View style={styles.cardBody}>
                        {/* Left: Avatar with Match Score */}

                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarOuterRing}>
                                <LinearGradient
                                    colors={profile.avatarColor}
                                    style={styles.avatarInner}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Icon name="account" size={scale(30)} color="#FFFFFF" />
                                    {!isLoggedIn && (
                                        <View style={styles.glassOverlay}>
                                            <View style={styles.lockIconContainer}>
                                                <Icon name="lock" size={scale(12)} color="#F59E0B" />
                                            </View>
                                            <Text style={styles.viewTextSmall}>{t('LOCKED_MSG')}</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </View>

                            {/* Badges in the 'play of match' space */}
                            <View style={styles.matchScoreContainer}>
                                {profile.verified && (
                                    <View style={styles.verifiedBadgeSmall}>
                                        <Icon name="shield-check" size={scale(12)} color="#4CAF50" />
                                        <Text style={styles.badgeLabelSmall}>Verified</Text>
                                    </View>
                                )}
                                {profile.horoscope && (
                                    <View style={styles.horoscopeBadgeSmall}>
                                        <Icon name="star" size={scale(12)} color="#FF9800" />
                                        <Text style={styles.badgeLabelSmall}>Horoscope</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Right: Info */}
                        <View style={styles.infoContainer}>
                            {/* Name & Age Row */}
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
                                        <Icon name="human-male-height" size={scale(14)} color="#666" />
                                        <Text style={styles.detailText}>{profile.height}</Text>
                                    </View>
                                    <View style={styles.detail}>
                                        <Icon name="om" size={scale(14)} color="#666" />
                                        <Text style={styles.detailText}>{profile.religion}</Text>
                                    </View>
                                    <View style={styles.detail}>
                                        <Icon name="account-group" size={scale(14)} color="#666" />
                                        <Text style={styles.detailText}>{profile.caste}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailCol}>
                                    <View style={styles.detail}>
                                        <Icon name="map-marker" size={scale(14)} color="#666" />
                                        <Text style={styles.detailText} numberOfLines={1}>{profile.location}</Text>
                                    </View>
                                    <View style={styles.detail}>
                                        <Icon name="school" size={scale(14)} color="#666" />
                                        <Text style={styles.detailText} numberOfLines={1}>{profile.education}</Text>
                                    </View>
                                    <View style={styles.detail}>
                                        <Icon name="briefcase" size={scale(14)} color="#666" />
                                        <Text style={styles.detailText} numberOfLines={1}>{profile.profession}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Badges & Button Row */}
                            <View style={styles.bottomRow}>
                                <View style={styles.badgesPlaceholder} />

                                {!isLoggedIn && (
                                    <TouchableOpacity style={styles.connectBtn} activeOpacity={0.8}>
                                        <LinearGradient
                                            colors={['#ef0d8d', '#ad0761']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.connectGradient}
                                        >
                                            <Icon name="account-plus" size={scale(18)} color="#FFFFFF" />
                                            <Text style={styles.connectText}>Register For Free</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
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
        backgroundColor: '#F8FAFC',
        paddingHorizontal: scale(14),
        paddingVertical: scale(10),
        borderBottomWidth: scale(1),
        borderBottomColor: '#F0F0F0',
    },
    profileBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },
    profileIdText: {
        fontSize: moderateScale(13),
        color: '#0277BD',
        fontWeight: '700',
        letterSpacing: scale(0.2),
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        borderRadius: scale(12),
        gap: scale(5),
    },
    statusDot: {
        width: scale(6),
        height: scale(6),
        borderRadius: scale(3),
        backgroundColor: '#4CAF50',
    },
    statusText: {
        fontSize: moderateScale(12),
        color: '#2E7D32',
        fontWeight: '600',
    },
    cardBody: {
        flexDirection: 'row',
        padding: scale(14),
    },
    avatarContainer: {
        alignItems: 'center',
        marginRight: scale(14),
    },
    avatarOuterRing: {
        width: scale(76),
        height: scale(76),
        borderRadius: scale(38),
        borderWidth: scale(2),
        borderColor: '#F59E0B',
        padding: scale(2),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(6),
        elevation: scale(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.15,
        shadowRadius: scale(3),
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: scale(38),
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: scale(72),
        height: scale(72),
        borderRadius: scale(36),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(6),
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: scale(2) },
                shadowOpacity: 0.15,
                shadowRadius: scale(4),
            },
            android: {
                elevation: scale(4),
            },
        }),
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
        marginTop: scale(5),
    },
    verifiedBadgeSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: scale(6),
        paddingVertical: scale(2),
        borderRadius: scale(8),
        gap: scale(3),
        minWidth: scale(65),
        justifyContent: 'center',
        borderWidth: scale(0.5),
        borderColor: '#C8E6C9',
    },
    horoscopeBadgeSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: scale(6),
        paddingVertical: scale(2),
        borderRadius: scale(8),
        gap: scale(3),
        minWidth: scale(65),
        justifyContent: 'center',
        borderWidth: scale(0.5),
        borderColor: '#FFE0B2',
    },
    badgeLabelSmall: {
        fontSize: moderateScale(9),
        fontWeight: '700',
        color: '#555',
    },
    badgesPlaceholder: {
        flex: 1,
    },
    infoContainer: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: scale(10),
        gap: scale(8),
    },
    name: {
        fontSize: moderateScale(17),
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
        lineHeight: moderateScale(22),
    },
    ageBadge: {
        backgroundColor: '#FFE4F3',
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        borderRadius: scale(12),
        borderWidth: scale(1),
        borderColor: '#fbc9e5',
    },
    ageText: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: '#ad0761',
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