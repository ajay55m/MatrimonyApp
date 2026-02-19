
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { scale, moderateScale } from '../../utils/responsive';
import { decodeUTF8String } from '../../utils/utf8Helper';
import { getSelectedProfiles } from '../../services/profileService';

const SelectedProfiles = () => {
    const navigation = useNavigation();
    const [profiles, setProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSelectedProfiles();
    }, []);

    const loadSelectedProfiles = async () => {
        try {
            const userDataJson = await AsyncStorage.getItem('userData');
            if (userDataJson) {
                const userData = JSON.parse(userDataJson);
                // Try multiple ID fields including internal ID which might be used as tamil_client_id
                const clientId = userData.tamil_client_id || userData.client_id || userData.profileid || userData.id;

                if (clientId) {
                    const response = await getSelectedProfiles(clientId);
                    if (response && response.status && Array.isArray(response.data)) {
                        setProfiles(response.data);
                    } else {
                        setProfiles([]);
                    }
                } else {
                    setError('User ID not found');
                }
            } else {
                setError('Please login to view selected profiles');
            }
        } catch (error) {
            console.error('Failed to load selected profiles', error);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const renderProfileCard = ({ item }) => {
        const name = item.name || 'Unknown';
        const imageUrl = item.profile_image;
        const profileId = item.profile_id || item.id;

        // Construct location string
        const locationLabel = item.location && item.location !== 'Unknown' ? item.location : (item.city || item.district || 'Tamil Nadu');

        // Education & Occupation
        const educationLabel = Array.isArray(item.education) ? item.education[0] : (item.education || '');
        const occupationLabel = item.occupation || 'Not Specified';

        return (
            <View style={styles.cardWrapper}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ProfileDetails', { profile: item })}
                >
                    <View style={styles.profileCard}>
                        {/* Header: ID (Left) | Status (Right) */}
                        <View style={styles.cardHeader}>
                            <View style={styles.profileBadge}>
                                <Text style={styles.profileIdText}>{profileId}</Text>
                            </View>
                            {/* Status Badge - mimicking "Recent" or "Online" style from Profile.jsx */}
                            <View style={styles.statusBadge}>
                                <View style={[styles.statusDot, { backgroundColor: '#F57C00' }]} />
                                <Text style={styles.statusText}>{item.lastActive || 'Recent'}</Text>
                            </View>
                        </View>

                        {/* Main Content */}
                        <View style={styles.cardBody}>
                            {/* Left: Avatar + Stacked Badges */}
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarOuterRing}>
                                    <View style={styles.avatarInner}>
                                        {imageUrl ? (
                                            <Image
                                                source={{ uri: imageUrl }}
                                                style={styles.avatar}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <LinearGradient
                                                colors={['#64B5F6', '#1976D2']}
                                                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                                            >
                                                <Icon name="account" size={scale(35)} color="#FFFFFF" />
                                            </LinearGradient>
                                        )}
                                    </View>
                                </View>

                                {/* Stacked Badges below Avatar */}
                                <View style={styles.matchScoreContainer}>
                                    {item.verified && (
                                        <View style={styles.verifiedBadgeSmall}>
                                            <Icon name="check-circle" size={scale(11)} color="#2E7D32" />
                                            <Text style={styles.badgeLabelSmall}>Verified</Text>
                                        </View>
                                    )}
                                    {/* Placeholder if verified is false to keep layout consistent or show other status */}
                                    {!item.verified && (
                                        <View style={styles.horoscopeBadgeSmall}>
                                            <Icon name="camera" size={scale(11)} color="#EF6C00" />
                                            <Text style={styles.badgeLabelSmall}>Photo Req</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Right: Info Area */}
                            <View style={styles.infoContainer}>
                                {/* Name and Age Row */}
                                <View style={styles.nameRow}>
                                    <Text style={styles.name} numberOfLines={2}>{name}</Text>
                                    <View style={styles.ageBadge}>
                                        <Text style={styles.ageText}>{item.age} Yrs</Text>
                                    </View>
                                </View>

                                {/* Details Grid - 2 columns */}
                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailCol}>
                                        <View style={styles.detail}>
                                            <Icon name="human-male-height" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText}>{item.height || '-'}</Text>
                                        </View>
                                        <View style={styles.detail}>
                                            <Icon name="om" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText}>{item.religion || '-'}</Text>
                                        </View>
                                        <View style={styles.detail}>
                                            <Icon name="account-group" size={scale(14)} color="#757575" />
                                            <Text style={styles.detailText}>{item.caste || '-'}</Text>
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
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.titleBadgeContainer}>
                    <LinearGradient
                        colors={['#ef0d8d', '#ad0761']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.titleBadge}
                    >
                        <Icon name="heart" size={scale(18)} color="#FFFFFF" />
                        <Text style={styles.headerTitle}>Selected Profiles ({profiles.length})</Text>
                    </LinearGradient>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#ef0d8d" />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Icon name="alert-circle-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>{error}</Text>
                </View>
            ) : profiles.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Icon name="heart-broken" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No profiles selected yet</Text>
                </View>
            ) : (
                <FlatList
                    data={profiles}
                    renderItem={renderProfileCard}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7ED', // Consistent cream background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(15),
        paddingTop: scale(10),
        justifyContent: 'space-between', // Changed to space-between to allow centering or right align effects if needed
    },
    backButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
    },
    titleBadgeContainer: {
        flex: 1,
        alignItems: 'flex-start', // Align left next to back button
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(8),
        borderRadius: scale(25),
        elevation: scale(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.2,
        shadowRadius: scale(4),
        gap: scale(8),
    },
    headerTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: scale(0.5),
    },
    listContent: {
        padding: scale(14),
        paddingTop: scale(5),
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
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
        backgroundColor: '#FFFFFF',
        paddingHorizontal: scale(14),
        paddingVertical: scale(8),
    },
    profileBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileIdText: {
        fontSize: moderateScale(14),
        color: '#1565C0',
        fontWeight: '700',
        letterSpacing: scale(0.2),
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        gap: scale(5),
    },
    statusDot: {
        width: scale(6),
        height: scale(6),
        borderRadius: scale(3),
        backgroundColor: '#FF9800',
    },
    statusText: {
        fontSize: moderateScale(11),
        color: '#EF6C00',
        fontWeight: '700',
    },
    cardBody: {
        flexDirection: 'row',
        padding: scale(14),
        paddingTop: 0,
    },
    avatarContainer: {
        alignItems: 'center',
        marginRight: scale(14),
    },
    avatarOuterRing: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        borderWidth: scale(3),
        borderColor: '#FFC107',
        padding: scale(4),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(8),
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
    },
    badgeLabelSmall: {
        fontSize: moderateScale(10),
        fontWeight: '600',
        color: '#333',
    },
    infoContainer: {
        flex: 1,
        paddingTop: scale(4),
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: scale(12),
        gap: scale(8),
    },
    name: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#000000',
        flexShrink: 1,
        lineHeight: moderateScale(24),
        fontFamily: 'NotoSansTamil-Bold',
    },
    ageBadge: {
        backgroundColor: '#FCE4EC',
        paddingHorizontal: scale(8),
        paddingVertical: scale(2),
        borderRadius: scale(4),
    },
    ageText: {
        fontSize: moderateScale(12),
        fontWeight: '700',
        color: '#EC407A',
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
});

export default SelectedProfiles;
