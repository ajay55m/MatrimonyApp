import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, moderateScale } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PageHeader = ({ title, onBack, rightComponent, icon, backIcon = 'arrow-left' }) => {
    const insets = useSafeAreaInsets();
    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={true} />
            <View style={[styles.header, { paddingTop: insets.top + scale(5) }]}>
                {onBack ? (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name={backIcon} size={24} color="#ad0761" />
                    </TouchableOpacity>
                ) : <View style={styles.backButtonPlaceholder} />}

                <View style={styles.titleBadgeContainer}>
                    <LinearGradient
                        colors={['#ef0d8d', '#ad0761']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.titleBadge}
                    >
                        {icon && <Icon name={icon} size={scale(18)} color="#FFFFFF" style={{ marginRight: scale(8) }} />}
                        <Text style={styles.headerTitle}>{title}</Text>
                    </LinearGradient>
                </View>

                {rightComponent ? <View style={styles.rightPlaceholder}>{rightComponent}</View> : <View style={styles.backButtonPlaceholder} />}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(15),
        paddingBottom: scale(10),
        backgroundColor: '#FFF',
    },
    backButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonPlaceholder: {
        width: scale(40),
    },
    titleBadgeContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(8),
        borderRadius: scale(25),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    rightPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        minWidth: scale(40),
        justifyContent: 'flex-end',
    },
});

export default PageHeader;
