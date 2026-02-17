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
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Components
import Footer from '../../components/Footer';
import SidebarMenu from '../../components/SidebarMenu';
import SearchFilter from '../../components/SearchFilter';
import Skeleton from '../../components/Skeleton';

// Translations
import { TRANSLATIONS } from '../../constants/translations';

const { width } = Dimensions.get('window');

const SearchScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

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

    const handleFooterNavigation = (tab) => {
        if (tab === 'HOME') {
            navigation.navigate('Main', { initialTab: 'HOME' });
        } else if (tab === 'CONTACT') {
            navigation.navigate('Contact');
        } else if (tab === 'SEARCH') {
            // Already here
        } else if (tab === 'PROFILE') {
            navigation.navigate('Profiles');
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userSession');
            setIsLoggedIn(false);
            setMenuVisible(false); // Close menu
            navigation.navigate('Main');
        } catch (e) {
            console.error('Logout error', e);
        }
    };

    const handleSearch = (searchData) => {
        console.log('Searching with:', searchData);
        navigation.navigate('Profiles', {
            searchResults: searchData.results,
            isSearch: true
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Header Spacer for Status Bar to avoid overlap */}
            <View style={{ height: insets.top + 10 }} />

            <View style={styles.header}>
                {/* Visual Balancer Removed (Left Alignment) */}

                <View style={styles.titleBadgeContainer}>
                    <LinearGradient
                        colors={['#ef0d8d', '#ad0761']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.titleBadge}
                    >
                        <Icon name="account-search" size={18} color="#FFFFFF" />
                        <Text style={styles.headerTitle}>{t('SEARCH')}</Text>
                    </LinearGradient>
                </View>

                {/* Right Side Actions - Avatar/Menu */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {isLoggedIn && (
                        <TouchableOpacity onPress={() => navigation.navigate('Main', { initialTab: 'HOME' })}>
                            <Image
                                source={require('../../assets/images/avatar_male.png')}
                                style={{ width: 35, height: 35, borderRadius: 17.5, borderWidth: 1.5, borderColor: '#fff' }}
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <Icon name="menu" size={28} color="#ad0761" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <Skeleton type="Search" />
            ) : (
                <>
                    {/* Content */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.contentContainer}>
                            <SearchFilter onSearch={handleSearch} t={t} isLoggedIn={isLoggedIn} />
                        </View>
                    </ScrollView>
                </>
            )}

            {/* Footer */}
            <View style={styles.footerWrapper}>
                <Footer
                    activeTab="SEARCH"
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
        paddingHorizontal: 15,
        paddingBottom: 10,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
        marginLeft: 8,
    },
    titleBadgeContainer: {
        // Removed flex/center to align left
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 25,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 14,
        paddingTop: 5,
        paddingBottom: 20,
    },
    contentContainer: {
        flex: 1,
    },
    footerWrapper: {
        marginBottom: 0,
    },
});

export default SearchScreen;
