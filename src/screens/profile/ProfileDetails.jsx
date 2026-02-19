import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, moderateScale } from '../../utils/responsive';
import { decodeUTF8String, decodeAllStrings } from '../../utils/utf8Helper';
import { getLabel, EDUCATION_MAP, OCCUPATION_MAP, RELIGION_MAP, CASTE_MAP, LOCATION_MAP } from '../../utils/dataMappings';
import { getProfile } from '../../services/profileService';
import SidebarMenu from '../../components/SidebarMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { profile } = route.params || {};

    const [profileData, setProfileData] = useState(profile);
    const [isLoading, setIsLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Use numeric ID if available as backend expects tamil_client_id (id)
    const profileId = profile?.id || profile?.profile_id;

    useEffect(() => {
        const checkLoginStatus = async () => {
            const session = await AsyncStorage.getItem('userSession');
            setIsLoggedIn(session === 'true');
        };
        checkLoginStatus();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userSession');
            setIsLoggedIn(false);
            setMenuVisible(false);
            navigation.navigate('Main');
        } catch (e) {
            console.error('Logout error', e);
        }
    };

    useEffect(() => {
        const fetchFullDetails = async () => {
            if (profileId) {
                try {
                    const result = await getProfile(profileId);
                    if (result && result.status && result.data) {
                        const fullData = result.data.tamil_profile || result.data.main_profile || result.data;
                        setProfileData(prev => ({
                            ...prev,
                            ...fullData,
                            id: fullData.profile_id || fullData.id || prev.id,
                            profile_id: fullData.profile_id || fullData.id || prev.profile_id
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch full profile details", err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        fetchFullDetails();
    }, [profileId]);

    // Save viewed profile locally
    useEffect(() => {
        const saveViewedProfile = async () => {
            if (!profileData || !profileId) return;

            try {
                // 1. Get existing list
                const storedList = await AsyncStorage.getItem('viewed_profiles_list');
                let list = storedList ? JSON.parse(storedList) : [];

                // 2. Check if already viewed
                const existingIndex = list.findIndex(p => (p.id == profileId || p.profile_id == profileId));

                if (existingIndex >= 0) {
                    // Update timestamp
                    list[existingIndex] = { ...profileData, viewedAt: new Date().toISOString() };
                } else {
                    // Add new
                    list.push({ ...profileData, viewedAt: new Date().toISOString() });

                    // 3. Update User Data Count (Optimistic)
                    const userDataJson = await AsyncStorage.getItem('userData');
                    if (userDataJson) {
                        const userData = JSON.parse(userDataJson);
                        // Parse as int, increment, save as string/int
                        let currentCount = parseInt(userData.viewed_profiles || '0');
                        userData.viewed_profiles = currentCount + 1;
                        await AsyncStorage.setItem('userData', JSON.stringify(userData));
                    }
                }

                // Save list
                await AsyncStorage.setItem('viewed_profiles_list', JSON.stringify(list));

            } catch (error) {
                console.error('Error saving viewed profile:', error);
            }
        };

        if (profileData && (profileData.id || profileData.profile_id)) {
            saveViewedProfile();
        }
    }, [profileData]);

    const data = profileData || {};

    if (!profileId) {
        return (
            <View style={styles.errorContainer}>
                <Text>Profile not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: '#ef0d8d', marginTop: 10, fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getValue = (val, defaultVal = '-') => (val && val !== '' && val !== '0' ? val : defaultVal);

    const name = decodeUTF8String(data.user_name || data.name || data.profile_name) || 'Unknown';
    const age = data.age || '-';

    let heightLabel = '-';
    if (data.height) {
        if (!isNaN(data.height) && parseInt(data.height) > 100) {
            heightLabel = `${data.height} cm`;
        } else {
            heightLabel = data.height;
        }
    } else if (data.height_feet && data.height_inches) {
        heightLabel = `${data.height_feet}ft ${data.height_inches}in`;
    }

    const districtName = getLabel(LOCATION_MAP, data.district);
    const cityName = getLabel(LOCATION_MAP, data.city);
    const locationStr = (data.location && data.location !== 'Unknown')
        ? data.location
        : ([cityName, districtName].filter(p => p && p !== '0' && p !== 'Unknown').join(', ') || '-');

    const religion = getLabel(RELIGION_MAP, data.religion) || data.religion || '-';
    const casteRaw = data.caste;
    const casteLabel = getLabel(CASTE_MAP, casteRaw) || casteRaw || '-';
    const religionCaste = `${religion} - ${casteLabel}`;

    const eduRaw = Array.isArray(data.education) ? data.education[0] : (data.education);
    const education = getLabel(EDUCATION_MAP, eduRaw) || eduRaw || '-';

    const occRaw = data.occupation || data.profession;
    const occupation = getLabel(OCCUPATION_MAP, occRaw) || occRaw || '-';

    const imageUrl = data.profile_image
        ? data.profile_image
        : (data.user_photo
            ? `https://nadarmahamai.com/uploads/${data.user_photo}`
            : (data.photo_data1 ? `https://nadarmahamai.com/uploads/${data.photo_data1}` : null));

    // ── Detail Row: alternating background for readability ──
    const DetailRow = ({ label, value, icon, index = 0 }) => (
        <View style={[styles.detailRow, index % 2 === 0 ? styles.detailRowEven : styles.detailRowOdd]}>
            <View style={styles.labelContainer}>
                {icon && <Icon name={icon} size={16} color="#ef0d8d" style={styles.rowIcon} />}
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <View style={styles.valueContainer}>
                <Text style={styles.detailSeparator}>:</Text>
                <Text style={styles.detailValue}>{getValue(value)}</Text>
            </View>
        </View>
    );

    // ── Section Header: left accent stripe ──
    const SectionHeader = ({ title, icon }) => (
        <View style={styles.sectionHeader}>
            <LinearGradient
                colors={['#ef0d8d', '#ad0761']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sectionIconBox}
            >
                <Icon name={icon} size={17} color="#FFF" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />
            <View style={{ height: (StatusBar.currentHeight || 24) + 10 }} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeftContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={22} color="#ef0d8d" />
                    </TouchableOpacity>
                    <LinearGradient
                        colors={['#ef0d8d', '#ad0761']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.titleBadge}
                    >
                        <Icon name="account-details" size={16} color="#FFFFFF" style={{ marginRight: 7 }} />
                        <Text style={styles.headerTitle}>Profile Details</Text>
                    </LinearGradient>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {isLoading && <ActivityIndicator color="#ef0d8d" size="small" />}
                    {isLoggedIn && (
                        <TouchableOpacity onPress={() => navigation.navigate('Main', { initialTab: 'HOME' })}>
                            <Image
                                source={require('../../assets/images/avatar_male.png')}
                                style={styles.avatarSmall}
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                        <Icon name="menu" size={24} color="#ad0761" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Summary Card */}
                <View style={styles.profileSummaryCard}>
                    {/* Top accent stripe */}
                    <LinearGradient
                        colors={['#ef0d8d', '#ad0761']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardTopStripe}
                    />

                    <View style={styles.profileSummaryInner}>
                        <View style={styles.avatarContainer}>
                            {/* Gradient ring around avatar */}
                            <LinearGradient
                                colors={['#ef0d8d', '#FFC107', '#ad0761']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.avatarGradientRing}
                            >
                                <View style={styles.avatarInnerBorder}>
                                    {imageUrl ? (
                                        <Image source={{ uri: imageUrl }} style={styles.avatar} />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Icon name="account" size={46} color="#FFF" />
                                        </View>
                                    )}
                                </View>
                            </LinearGradient>

                            {/* Verified badge — pill style */}
                            <View style={styles.verifiedBadge}>
                                <Icon name="check-decagram" size={12} color="#4CAF50" />
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={[styles.nameText, { fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System' }]}>{name}</Text>

                            {/* ID badge */}
                            <View style={styles.idBadge}>
                                <Icon name="identifier" size={11} color="#ad0761" />
                                <Text style={styles.idText}>{profileId}</Text>
                            </View>

                            <LinearGradient
                                colors={['#FFF0FA', '#FFE4F5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.highlightBadge}
                            >
                                <Text style={styles.highlightText}>{age} Yrs  •  {heightLabel}</Text>
                            </LinearGradient>

                            <View style={styles.miniInfoRow}>
                                <Icon name="school" size={13} color="#ef0d8d" />
                                <Text style={styles.miniInfoText} numberOfLines={1}>{education}</Text>
                            </View>
                            <View style={styles.miniInfoRow}>
                                <Icon name="briefcase" size={13} color="#ef0d8d" />
                                <Text style={styles.miniInfoText} numberOfLines={1}>{occupation}</Text>
                            </View>
                            <View style={styles.miniInfoRow}>
                                <Icon name="map-marker" size={13} color="#ef0d8d" />
                                <Text style={styles.miniInfoText} numberOfLines={1}>{locationStr}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Sections */}
                <View style={styles.sectionsWrapper}>
                    <View style={styles.sectionCard}>
                        <SectionHeader title="Basic Details" icon="account-details" />
                        <DetailRow index={0} label="Date of Birth" value={data.dob || data.date_of_birth} icon="calendar" />
                        <DetailRow index={1} label="Height" value={heightLabel} icon="human-male-height" />
                        <DetailRow index={2} label="Color / Complexion" value={data.complexion || data.color} icon="palette" />
                        <DetailRow index={3} label="Mother Tongue" value={data.language || data.mother_tongue || 'Tamil'} icon="translate" />
                        <DetailRow index={4} label="Place of Birth" value={data.native_place || data.place_of_birth} icon="map" />
                    </View>

                    <View style={styles.sectionCard}>
                        <SectionHeader title="Religious Information" icon="om" />
                        <DetailRow index={0} label="Religion & Caste" value={religionCaste} icon="khanda" />
                        <DetailRow index={1} label="Family God" value={data.family_god || data.kuladeivam} icon="home-heart" />
                        <DetailRow index={2} label="Star" value={data.star} icon="star-face" />
                        <DetailRow index={3} label="Raasi" value={data.raasi} icon="moon-waning-crescent" />
                    </View>

                    <View style={styles.sectionCard}>
                        <SectionHeader title="Professional Information" icon="briefcase" />
                        <DetailRow index={0} label="Education" value={education} icon="school" />
                        <DetailRow index={1} label="Qualification" value={data.education_details || education} icon="certificate" />
                        <DetailRow index={2} label="Occupation" value={occupation} icon="briefcase-outline" />
                        <DetailRow index={3} label="Monthly Income" value={data.income || data.monthly_income} icon="cash" />
                        <DetailRow index={4} label="Work Place" value={data.work_place} icon="map-marker-radius" />
                    </View>

                    <View style={styles.sectionCard}>
                        <SectionHeader title="Family Details" icon="home-group" />
                        <DetailRow
                            index={0}
                            label="Father Name"
                            value={data.father_name ? `${data.father_name}${data.father_occupation ? ` (${data.father_occupation})` : ''}` : '-'}
                            icon="human-male"
                        />
                        <DetailRow
                            index={1}
                            label="Mother Name"
                            value={data.mother_name ? `${data.mother_name}${data.mother_occupation ? ` (${data.mother_occupation})` : ''}` : '-'}
                            icon="human-female"
                        />
                    </View>

                    <View style={styles.sectionCard}>
                        <SectionHeader title="Contact Address" icon="map-marker-radius" />
                        <Text style={styles.notesText}>{getValue(data.full_address || data.address, 'No address provided.')}</Text>
                    </View>

                    <View style={styles.sectionCard}>
                        <SectionHeader title="Expectations / Notes" icon="message-text" />
                        <Text style={styles.notesText}>{getValue(data.expectation, 'No specific expectations mentioned.')}</Text>
                        {data.property_details && (
                            <View style={styles.propertyBlock}>
                                <Text style={styles.subSectionTitle}>Property / Dowry Details:</Text>
                                <Text style={styles.notesText}>{data.property_details}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBarWrapper}>
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.actionBtnSecondary}>
                        <Icon name="star-outline" size={19} color="#ef0d8d" />
                        <Text style={styles.actionTextSecondary}>Shortlist</Text>
                    </TouchableOpacity>

                    <LinearGradient
                        colors={['#ef0d8d', '#ad0761']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionBtnPrimary}
                    >
                        <TouchableOpacity style={styles.actionBtnPrimaryInner}>
                            <Icon name="phone" size={19} color="#FFF" />
                            <Text style={styles.actionTextPrimary}>Contact Now</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>

            <SidebarMenu
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                t={(key) => key}
                navigation={navigation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7ED',
    },

    // ── Header ──────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 10,
        paddingTop: 5,
    },
    headerLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 7,
        marginRight: 8,
        backgroundColor: '#FFF',
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#ef0d8d',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#ef0d8d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.4,
    },
    avatarSmall: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: '#ef0d8d',
    },
    menuButton: {
        padding: 4,
    },

    // ── ScrollView ───────────────────────────────────────
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: moderateScale(15),
        paddingBottom: 20,
        paddingTop: 4,
    },

    // ── Profile Summary Card ─────────────────────────────
    profileSummaryCard: {
        backgroundColor: '#FFF',
        borderRadius: 18,
        marginBottom: 18,
        elevation: 5,
        shadowColor: '#ef0d8d',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        overflow: 'hidden',
        marginTop: 6,
    },
    cardTopStripe: {
        height: 4,
        width: '100%',
    },
    profileSummaryInner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    avatarContainer: {
        marginRight: 14,
        alignItems: 'center',
    },
    avatarGradientRing: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
    },
    avatarInnerBorder: {
        width: '100%',
        height: '100%',
        borderRadius: 41,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 39,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 39,
        backgroundColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 20,
    },
    verifiedText: {
        fontSize: 10,
        color: '#2E7D32',
        marginLeft: 3,
        fontWeight: '700',
    },
    infoContainer: {
        flex: 1,
    },
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 5,
        fontFamily: 'NotoSansTamil-Bold',
    },
    idBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF0FA',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#FFCCE8',
    },
    idText: {
        fontSize: 11,
        color: '#ad0761',
        fontWeight: '700',
    },
    highlightBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 9,
    },
    highlightText: {
        color: '#ef0d8d',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.3,
    },
    miniInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        gap: 6,
    },
    miniInfoText: {
        fontSize: 12.5,
        color: '#555',
        fontFamily: 'NotoSansTamil-Regular',
        flex: 1,
    },

    // ── Section Cards ────────────────────────────────────
    sectionsWrapper: {
        gap: 14,
    },
    sectionCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FFF0FA',
        paddingBottom: 10,
    },
    sectionIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 11,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: 0.2,
    },

    // ── Detail Rows ──────────────────────────────────────
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 2,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 6,
    },
    detailRowEven: {
        backgroundColor: 'transparent',
    },
    detailRowOdd: {
        backgroundColor: '#FFF8FC',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '42%',
        paddingRight: 5,
    },
    rowIcon: {
        marginRight: 7,
    },
    detailLabel: {
        fontSize: 12.5,
        color: '#777',
        flexShrink: 1,
    },
    valueContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    detailSeparator: {
        color: '#ef0d8d',
        marginRight: 8,
        fontWeight: 'bold',
    },
    detailValue: {
        flex: 1,
        fontSize: 13.5,
        color: '#222',
        fontWeight: '500',
        fontFamily: 'NotoSansTamil-Regular',
        lineHeight: 20,
    },

    // ── Notes ────────────────────────────────────────────
    notesText: {
        fontSize: 13.5,
        color: '#444',
        lineHeight: 22,
        fontFamily: 'NotoSansTamil-Regular',
    },
    propertyBlock: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#FFF0FA',
    },
    subSectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#ad0761',
        marginBottom: 6,
    },

    // ── Bottom Bar ───────────────────────────────────────
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    bottomBar: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        padding: 14,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#FFCCE8',
        elevation: 12,
        shadowColor: '#ef0d8d',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        gap: 12,
    },
    actionBtnSecondary: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#ef0d8d',
        borderRadius: 28,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF8FC',
    },
    actionBtnPrimary: {
        flex: 1.5,
        borderRadius: 28,
        elevation: 4,
        shadowColor: '#ef0d8d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
    },
    actionBtnPrimaryInner: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    actionTextSecondary: {
        color: '#ef0d8d',
        fontWeight: '700',
        fontSize: 14,
    },
    actionTextPrimary: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProfileDetails;