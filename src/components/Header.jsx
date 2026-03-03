import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, moderateScale } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    white: '#FFFFFF',
    sidemenuHeader: '#ad0761',
};

const Header = ({ setMenuVisible, isLoggedIn, onProfilePress, onBack }) => {
    const insets = useSafeAreaInsets();
    return (
        <ImageBackground
            source={require('../../assets/images/bg-saffron.jpg.jpeg')}
            style={[styles.header, { paddingTop: insets.top + scale(5) }]}
            resizeMode="cover"
        >
            <View style={styles.headerContent}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="arrow-left" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                )}
                <Image
                    source={require('../assets/images/nadar-mahamai5.png')}
                    style={[styles.newHeaderLogo, onBack && { marginLeft: scale(5) }]}
                    resizeMode="contain"
                />

                <View style={styles.headerRight}>
                    {isLoggedIn && (
                        <TouchableOpacity
                            onPress={onProfilePress}
                            style={styles.avatarTouch}
                        >
                            <Image
                                source={require('../assets/images/avatar_male.jpg')}
                                style={styles.headerAvatar}
                            />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.headerMenuBtn}
                        onPress={() => setMenuVisible(true)}
                    >
                        <Icon name="menu" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingBottom: scale(8),
        paddingLeft: 0,
        paddingRight: scale(10),
        borderBottomLeftRadius: scale(20),
        borderBottomRightRadius: scale(20),
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    backButton: {
        paddingLeft: scale(15),
        paddingRight: scale(5),
    },
    newHeaderLogo: {
        width: scale(320),
        height: scale(75),
        marginLeft: -scale(15),
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: scale(5),
        gap: scale(10),
    },
    headerMenuBtn: {
        padding: scale(5),
    },
    avatarTouch: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    headerAvatar: {
        width: scale(35),
        height: scale(35),
        borderRadius: scale(17.5),
        borderWidth: scale(1.5),
        borderColor: COLORS.white,
    },
});

export default Header;