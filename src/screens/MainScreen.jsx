import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Modal,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

// Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import SidebarMenu from '../components/SidebarMenu';
import HomeScreen from './HomeScreen';
import Dashboard from './Dashboard';

import { TRANSLATIONS } from '../constants/translations';
import { loginUser } from '../services/authService';

const { width } = Dimensions.get('window');

function MainScreen({ route }) {
    const navigation = useNavigation();

    // Global App State
    const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading

    // Initialize tab from params or default to HOME
    const initialTab = route?.params?.initialTab || 'HOME';
    const [activeTab, setActiveTab] = useState(initialTab);

    const [menuVisible, setMenuVisible] = useState(false);
    const [lang, setLang] = useState('ta'); // 'en' or 'ta'

    // Update activeTab when route params change (e.g. navigation from other screens)
    useEffect(() => {
        if (route?.params?.initialTab) {
            setActiveTab(route.params.initialTab);
            // Clear params to avoid sticking to this tab on subsequent re-renders if intended
            navigation.setParams({ initialTab: undefined });
        }
    }, [route?.params?.initialTab]);

    // Translation Helper
    const t = (key) => TRANSLATIONS[lang][key] || key;

    // Login Modal State
    const [loginVisible, setLoginVisible] = useState(false);
    const [profileId, setProfileId] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const session = await AsyncStorage.getItem('userSession');
            setIsLoggedIn(session === 'true');
        } catch (e) {
            console.error('Failed to load session', e);
            setIsLoggedIn(false);
        }
    };

    const handleLoginSuccess = async (userData) => {
        try {
            await AsyncStorage.setItem('userSession', 'true');
            if (userData) {
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                if (userData.tamil_client_id) {
                    await AsyncStorage.setItem('tamil_client_id', userData.tamil_client_id);
                }
            }
            setIsLoggedIn(true);
            setLoginVisible(false);
        } catch (e) {
            console.error('Failed to save session', e);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userSession');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('tamil_client_id');
            setIsLoggedIn(false);
            setActiveTab('HOME'); // Reset to Home on logout
        } catch (e) {
            console.error('Failed to clear session', e);
        }
    };

    const handleLogoutConfirm = () => {
        Alert.alert(
            t('LOGOUT_CONFIRM_TITLE'),
            t('LOGOUT_CONFIRM_BODY'),
            [
                { text: t('NO'), style: 'cancel' },
                {
                    text: t('YES'), onPress: handleLogout, style: 'destructive'
                },
            ]
        );
    };

    const handleForgotPassword = () => {
        Alert.alert(
            t('FORGOT_PASSWORD_TITLE') || 'Forgot Password',
            t('FORGOT_PASSWORD_MSG') || 'Please contact administrator to reset your password.',
            [{ text: t('OK') || 'OK' }]
        );
    };

    const submitLogin = async () => {
        if (!profileId || !password) {
            Alert.alert(t('ERROR'), t('FILL_ALL_FIELDS') || 'Please fill in all fields');
            return;
        }

        try {
            const result = await loginUser(profileId, password);
            if (result.status) {
                handleLoginSuccess(result.data);
            } else {
                Alert.alert(t('ERROR'), result.message || t('LOGIN_FAIL'));
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert(t('ERROR'), t('SOMETHING_WENT_WRONG') || 'Something went wrong. Please try again later.');
        }
    };

    // Main Content Controller Logic
    const renderContent = () => {
        // 1. Dashboard Logic: Only if Logged In AND Tab is Home
        if (activeTab === 'HOME' && isLoggedIn) {
            return <Dashboard t={t} />;
        }

        // 2. Landing/Guest Logic or other Tabs
        return (
            <HomeScreen
                activeTab={activeTab}
                onLoginPress={() => setLoginVisible(true)}
                t={t}
            />
        );
    };

    const renderLoginModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={loginVisible}
            onRequestClose={() => setLoginVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.loginModalContainer}>
                    <TouchableOpacity
                        style={styles.closeModalBtn}
                        onPress={() => setLoginVisible(false)}
                    >
                        <Icon name="close" size={24} color="#ef0d8d" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>{t('LOGIN')}</Text>
                    <Text style={styles.modalSubtitle}>{t('PLEASE_LOGIN')}</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>{t('PROFILE_ID') || 'Profile ID'}</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="account" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="HN1234..."
                                placeholderTextColor="#999"
                                value={profileId}
                                onChangeText={setProfileId}
                                textContentType="username"
                                autoComplete="username"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>{t('PASSWORD') || 'Password'}</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="******"
                                placeholderTextColor="#999"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                textContentType="password"
                                autoComplete="password"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.fullWidthBtn}
                        onPress={submitLogin}
                    >
                        <LinearGradient
                            colors={['#ef0d8d', '#ad0761']}
                            style={styles.btnGradient}
                        >
                            <Text style={styles.btnText}>{t('LOGIN')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.loginExtraActions}>
                        <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
                            <Text style={styles.forgotText}>{t('FORGOT_PASSWORD') || 'Forgot Password?'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.registerLinkBtn}
                            onPress={() => {
                                setLoginVisible(false);
                                navigation.navigate('Register');
                            }}
                        >
                            <Text style={styles.registerLinkText}>
                                {t('NO_ACCOUNT') || "Don't have an account?"} <Text style={styles.registerLinkSpan}>{t('REGISTER')}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (isLoggedIn === null) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFF7ED' }} />
        );
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* 1. Header Control */}
            <Header
                setMenuVisible={setMenuVisible}
                isLoggedIn={isLoggedIn}
                onProfilePress={() => setMenuVisible(true)}  // Header Avatar now opens Sidebar (User Profile)
            />

            {/* 2. Main Content Control */}
            <View style={styles.contentContainer}>
                {renderContent()}
            </View>

            {/* 3. Footer Control */}
            <View style={styles.footerContainer}>
                <Footer
                    activeTab={activeTab}
                    t={t}
                    setActiveTab={(tab) => {
                        // 1. Home is always accessible
                        if (tab === 'HOME') {
                            setActiveTab(tab);
                            return;
                        }

                        // 2. Strict Login Wall for everything else
                        if (!isLoggedIn) {
                            setLoginVisible(true);
                            return;
                        }

                        // 3. Navigation for Logged-In Users
                        if (tab === 'CONTACT') {
                            navigation.navigate('Contact');
                        } else if (tab === 'SEARCH') {
                            navigation.navigate('Search');
                        } else if (tab === 'PROFILE') {
                            navigation.navigate('Profiles');
                        }
                    }}
                />
            </View>

            {/* 4. Overlays/Modals */}
            <SidebarMenu
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogoutConfirm}
                t={t}
            />

            {renderLoginModal()}

        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFF7ED',
    },
    contentContainer: {
        flex: 1,
    },
    footerContainer: {
        // Footer styles
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginModalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    closeModalBtn: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ef0d8d',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    modalInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    fullWidthBtn: {
        marginTop: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loginExtraActions: {
        marginTop: 20,
        alignItems: 'center',
        gap: 15,
    },
    forgotBtn: {
        alignItems: 'center',
    },
    forgotText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    registerLinkBtn: {
        marginTop: 5,
    },
    registerLinkText: {
        color: '#666',
        fontSize: 14,
    },
    registerLinkSpan: {
        color: '#ef0d8d',
        fontWeight: 'bold',
    },
});

export default MainScreen;
