import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, moderateScale, width } from '../utils/responsive';
import { searchProfiles } from '../services/profileService';
import { ActivityIndicator } from 'react-native';
import ModalSelector from './ModalSelector';

const COLORS = {
    primary: '#ef5c0dff',
    primaryGradientStart: '#fe8229ff',
    primaryGradientEnd: '#d6450bff',
    ctaGradientStart: '#e5a135ff',
    ctaGradientEnd: '#8e5000ff',
    white: '#FFFFFF',
    textMain: '#1F2937',
    textSub: '#6B7280',
    gold: '#F59E0B',
};

// ─────────────────────────────────────────────────────────────
// Helper: returns true when a value is a real selection
// (not empty, not a "SELECT_*" placeholder)
// ─────────────────────────────────────────────────────────────
const isValidSelection = (value) =>
    value &&
    value.trim() !== '' &&
    !value.startsWith('SELECT_');

// ─────────────────────────────────────────────────────────────
// Helper: validate & normalise age range
//   • ensures both values are numbers inside [18, 90]
//   • swaps them if from > to
// ─────────────────────────────────────────────────────────────
const normaliseAgeRange = (from, to) => {
    let f = Math.max(18, Math.min(90, parseInt(from, 10) || 18));
    let t = Math.max(18, Math.min(90, parseInt(to, 10) || 90));
    if (f > t) [f, t] = [t, f]; // swap silently
    return { ageFrom: String(f), ageTo: String(t) };
};

const SearchFilter = ({ onSearch, t, isLoggedIn = false }) => {
    const [searchMode, setSearchMode] = useState('normal');
    const [loading, setLoading] = useState(false);

    // Modal States
    const [ageModalVisible, setAgeModalVisible] = useState(false);
    const [ageFromModalVisible, setAgeFromModalVisible] = useState(false);
    const [ageToModalVisible, setAgeToModalVisible] = useState(false);

    // ── Normal Filters (Quick Search) ──────────────────────────
    const [filters, setFilters] = useState({
        lookingFor: 'BRIDE',
        age: '18',
        religion: 'SELECT_RELIGION',
        caste: 'SELECT_CASTE',   // ← was hard-coded 'Nadar'; now a real filter
    });

    // ── Advanced Filters ───────────────────────────────────────
    const [advFilters, setAdvFilters] = useState({
        searchId: '',
        seeking: 'WOMAN',
        ageFrom: '18',
        ageTo: '30',
        district: 'SELECT_DISTRICT',
        city: 'SELECT_CITY',
        religion: 'SELECT_RELIGION',
        caste: 'SELECT_CASTE',          // ← added
        nativeDirection: 'SELECT_DIRECTION',
        qualification: 'SELECT_QUALIFICATION',
        work: 'SELECT_WORK',
        raasi: 'SELECT_RAASI',
        star: 'SELECT_STAR',            // ← now properly wired
        color: 'SELECT_COLOR',
        jewel: 'SELECT_JEWEL',          // ← maps to jewel column
    });

    const cycleNormalFilter = (key, options) => {
        const currIdx = options.indexOf(filters[key]);
        const nextIdx = (currIdx + 1) % options.length;
        setFilters(prev => ({ ...prev, [key]: options[nextIdx] }));
    };

    const cycleAdvFilter = (key, options) => {
        const currIdx = options.indexOf(advFilters[key]);
        const nextIdx = (currIdx + 1) % options.length;
        setAdvFilters(prev => ({ ...prev, [key]: options[nextIdx] }));
    };

    // ─────────────────────────────────────────────────────────────
    // Age-To modal handler with auto-correction
    // ─────────────────────────────────────────────────────────────
    const handleAgeToSelect = (val) => {
        const { ageFrom, ageTo } = normaliseAgeRange(advFilters.ageFrom, val);
        setAdvFilters(prev => ({ ...prev, ageFrom, ageTo }));
    };

    const handleAgeFromSelect = (val) => {
        const { ageFrom, ageTo } = normaliseAgeRange(val, advFilters.ageTo);
        setAdvFilters(prev => ({ ...prev, ageFrom, ageTo }));
    };

    // ─────────────────────────────────────────────────────────────
    // Build API payload & call backend
    // ─────────────────────────────────────────────────────────────
    const handleSearch = async () => {
        setLoading(true);

        try {
            const apiPayload = { limit: 50 };

            /* ══════════════════════════════════════
               NORMAL SEARCH
            ══════════════════════════════════════ */
            if (searchMode === 'normal') {

                // Gender
                apiPayload.gender = filters.lookingFor === 'BRIDE' ? 'Female' : 'Male';

                // Age (use chosen age as minimum; 60 as ceiling)
                const ageInt = parseInt(filters.age, 10) || 18;
                apiPayload.age_from = String(ageInt);
                apiPayload.age_to = '60';

                // Religion – only if a real value is chosen
                if (isValidSelection(filters.religion)) {
                    apiPayload.religion = filters.religion;
                }

                // Caste – only if a real value is chosen
                if (isValidSelection(filters.caste)) {
                    apiPayload.caste = filters.caste;
                }
            }

            /* ══════════════════════════════════════
               ADVANCED SEARCH
            ══════════════════════════════════════ */
            else {

                // Profile ID
                if (advFilters.searchId.trim()) {
                    apiPayload.profile_id = advFilters.searchId.trim();
                }

                // Gender
                apiPayload.gender =
                    advFilters.seeking === 'WOMAN' ? 'Female' : 'Male';

                // Age Range – validate before sending
                const { ageFrom, ageTo } = normaliseAgeRange(
                    advFilters.ageFrom,
                    advFilters.ageTo
                );
                apiPayload.age_from = ageFrom;
                apiPayload.age_to = ageTo;

                // District
                if (isValidSelection(advFilters.district)) {
                    apiPayload.district = advFilters.district;
                }

                // City  ← previously missing
                if (isValidSelection(advFilters.city)) {
                    apiPayload.city = advFilters.city;
                }

                // Religion
                if (isValidSelection(advFilters.religion)) {
                    apiPayload.religion = advFilters.religion;
                }

                // Caste  ← previously missing
                if (isValidSelection(advFilters.caste)) {
                    apiPayload.caste = advFilters.caste;
                }

                // Native Direction  ← previously missing
                if (isValidSelection(advFilters.nativeDirection)) {
                    apiPayload.native_direction = advFilters.nativeDirection;
                }

                // Education / Qualification
                if (isValidSelection(advFilters.qualification)) {
                    apiPayload.education = advFilters.qualification;
                }

                // Occupation / Work
                if (isValidSelection(advFilters.work)) {
                    apiPayload.occupation = advFilters.work;
                }

                // Raasi
                if (isValidSelection(advFilters.raasi)) {
                    apiPayload.raasi = advFilters.raasi;
                }

                // Star  ← previously missing
                if (isValidSelection(advFilters.star)) {
                    apiPayload.star = advFilters.star;
                }

                // Complexion / Color
                if (isValidSelection(advFilters.color)) {
                    apiPayload.complexion = advFilters.color;
                }

                // Jewel  ← now its own column (not body_type)
                if (isValidSelection(advFilters.jewel)) {
                    apiPayload.jewel = advFilters.jewel;
                }
            }

            console.log("Final API Payload:", apiPayload);

            const result = await searchProfiles(apiPayload);

            // Sort results by ascending age to ensure filtered age (e.g. 34) appears first
            try {
                if (result.status && Array.isArray(result.data)) {
                    result.data.sort((a, b) => {
                        const ageA = parseInt(a.age, 10) || 0;
                        const ageB = parseInt(b.age, 10) || 0;
                        return ageA - ageB;
                    });
                }
            } catch (sortError) {
                console.warn("Sorting failed, displaying unsorted results:", sortError);
            }

            if (onSearch) {
                onSearch({
                    mode: searchMode,
                    filters: searchMode === 'normal' ? filters : advFilters,
                    results: result.status ? result.data : [],
                    count: result.count || 0,
                });
            }

        } catch (error) {
            console.log("Search Error:", error);

            if (onSearch) {
                onSearch({
                    mode: searchMode,
                    filters: searchMode === 'normal' ? filters : advFilters,
                    results: [],
                    count: 0,
                    error: true,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const ageOptions = Array.from({ length: 73 }, (_, i) => (i + 18).toString());

    return (
        <View style={styles.searchWrapper}>
            {/* Top Navigation Bar - Only show if logged in */}
            {isLoggedIn && (
                <View style={styles.topNavBar}>
                    <View style={styles.navLeft}>
                        <TouchableOpacity
                            style={[styles.navTab, searchMode === 'normal' && styles.navTabActive]}
                            onPress={() => setSearchMode('normal')}
                        >
                            <Text style={[styles.navTabText, searchMode === 'normal' && styles.navTabTextActive]}>{t('NORMAL_SEARCH')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.navTab, searchMode === 'advanced' && styles.navTabActive]}
                            onPress={() => setSearchMode('advanced')}
                        >
                            <Text style={[styles.navTabText, searchMode === 'advanced' && styles.navTabTextActive]}>{t('ADVANCED_SEARCH')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {isLoggedIn && <View style={{ height: 1, backgroundColor: '#DDD', marginBottom: 15 }} />}

            <View>
                {/* Title Section */}
                {searchMode === 'normal' && (
                    <View style={styles.searchTitleRow}>
                        <Text style={styles.searchWidgetTitle}>{t('QUICK_SEARCH_TITLE')}</Text>
                        <Text style={styles.searchWidgetSubtitle}>{t('QUICK_SEARCH_SUBTITLE')}</Text>
                    </View>
                )}

                {searchMode === 'advanced' && (
                    <View style={styles.searchTitleRow}>
                        <Text style={styles.searchWidgetTitle}>{t('ADV_SEARCH_TITLE')}</Text>
                        <Text style={styles.searchWidgetSubtitle}>{t('ADV_SEARCH_SUBTITLE')}</Text>
                    </View>
                )}

                {searchMode === 'normal' ? (
                    /* ── Normal / Quick Search Form ──────────────────── */
                    <View style={styles.formGrid}>
                        <TouchableOpacity
                            style={styles.inputGroup}
                            onPress={() => cycleNormalFilter('lookingFor', ['BRIDE', 'GROOM'])}
                        >
                            <Text style={styles.label}>{t('SEEKING')}</Text>
                            <View style={styles.pickerBox}>
                                <Text style={styles.pickerText}>{t(filters.lookingFor === 'BRIDE' ? 'WOMAN' : 'MAN')}</Text>
                                <Icon name="chevron-down" size={16} color={COLORS.textSub} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.inputGroup}
                            onPress={() => setAgeModalVisible(true)}
                        >
                            <Text style={styles.label}>{t('AGE')}</Text>
                            <View style={styles.pickerBox}>
                                <Text style={styles.pickerText}>{filters.age}</Text>
                                <Icon name="chevron-down" size={16} color={COLORS.textSub} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.inputGroup}
                            onPress={() => cycleNormalFilter('religion', ['SELECT_RELIGION', 'HINDU', 'CHRISTIAN'])}
                        >
                            <Text style={styles.label}>{t('RELIGION')}</Text>
                            <View style={styles.pickerBox}>
                                <Text style={styles.pickerText}>{t(filters.religion)}</Text>
                                <Icon name="chevron-down" size={16} color={COLORS.textSub} />
                            </View>
                        </TouchableOpacity>

                        {/* ← Caste now properly cycles and sends to API */}
                        <TouchableOpacity
                            style={styles.inputGroup}
                            onPress={() => cycleNormalFilter('caste', ['SELECT_CASTE', 'Nadar', 'Mudaliar', 'Gounder'])}
                        >
                            <Text style={styles.label}>{t('CASTE')}</Text>
                            <View style={styles.pickerBox}>
                                <Text style={styles.pickerText}>
                                    {isValidSelection(filters.caste) ? filters.caste : t('SELECT_CASTE')}
                                </Text>
                                <Icon name="chevron-down" size={16} color={COLORS.textSub} />
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* ── Advanced Search Form ─────────────────────────── */
                    <View>
                        <Text style={styles.sectionHeaderTitle}>General</Text>

                        <View style={styles.fullWidthInputGroup}>
                            <Text style={styles.label}>{t('SEARCH_BY_ID')}</Text>
                            <TextInput
                                style={styles.textInputBox}
                                placeholder=""
                                value={advFilters.searchId}
                                onChangeText={(text) =>
                                    setAdvFilters(prev => ({ ...prev, searchId: text }))
                                }
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.fullWidthInputGroup}
                            onPress={() => cycleAdvFilter('seeking', ['WOMAN', 'MAN'])}
                        >
                            <Text style={styles.label}>{t('SEEKING')} <Text style={{ color: 'red' }}>*</Text></Text>
                            <View style={styles.pickerBox}>
                                <Text style={styles.pickerText}>{t(advFilters.seeking)}</Text>
                                <Icon name="chevron-down" size={20} color={COLORS.textSub} />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.fullWidthInputGroup}>
                            <Text style={styles.label}>{t('AGE')} <Text style={{ color: 'red' }}>*</Text></Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <TouchableOpacity
                                    style={[styles.pickerBox, { flex: 1 }]}
                                    onPress={() => setAgeFromModalVisible(true)}
                                >
                                    <Text style={styles.pickerText}>{advFilters.ageFrom}</Text>
                                    <Icon name="chevron-down" size={16} color={COLORS.textSub} />
                                </TouchableOpacity>
                                <Text>-</Text>
                                <TouchableOpacity
                                    style={[styles.pickerBox, { flex: 1 }]}
                                    onPress={() => setAgeToModalVisible(true)}
                                >
                                    <Text style={styles.pickerText}>{advFilters.ageTo}</Text>
                                    <Icon name="chevron-down" size={16} color={COLORS.textSub} />
                                </TouchableOpacity>
                                <Text style={{ color: '#666' }}>years</Text>
                            </View>
                        </View>

                        <View style={styles.formGrid}>
                            {[
                                {
                                    label: t('DISTRICT'), key: 'district',
                                    opts: ['SELECT_DISTRICT', 'CHENNAI', 'MADURAI', 'TIRUNELVELI'],
                                },
                                {
                                    label: t('CITY'), key: 'city',
                                    opts: ['SELECT_CITY', 'ADYAR', 'ANNA_NAGAR', 'T_NAGAR'],
                                },
                                {
                                    label: t('RELIGION'), key: 'religion',
                                    opts: ['SELECT_RELIGION', 'HINDU', 'CHRISTIAN'],
                                },
                                {
                                    label: t('CASTE'), key: 'caste',           // ← added
                                    opts: ['SELECT_CASTE', 'Nadar', 'Mudaliar', 'Gounder'],
                                },
                                {
                                    label: t('NATIVE_DIRECTION'), key: 'nativeDirection',
                                    opts: ['SELECT_DIRECTION', 'NORTH', 'SOUTH', 'EAST', 'WEST'],
                                },
                                {
                                    label: t('QUALIFICATION'), key: 'qualification',
                                    opts: ['SELECT_QUALIFICATION', 'BE', 'MBBS', 'BCOM', 'MSC'],
                                },
                                {
                                    label: t('WORK'), key: 'work',
                                    opts: ['SELECT_WORK', 'PRIVATE', 'GOVERNMENT', 'BUSINESS', 'TEACHER', 'ENGINEER', 'DOCTOR'],
                                },
                                {
                                    label: t('RAASI'), key: 'raasi',
                                    opts: ['SELECT_RAASI', 'MESHAM', 'RISHABAM', 'MITHUNAM'],
                                },
                                {
                                    label: t('STAR'), key: 'star',            // ← now wired
                                    opts: ['SELECT_STAR', 'ASHWINI', 'BHARANI'],
                                },
                                {
                                    label: t('COLOR'), key: 'color',
                                    opts: ['SELECT_COLOR', 'FAIR', 'WHEATISH', 'DARK'],
                                },
                                {
                                    label: t('JEWEL'), key: 'jewel',          // ← jewel column
                                    opts: ['SELECT_JEWEL', 'YES', 'NO'],
                                },
                            ].map((field, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.inputGroup}
                                    onPress={() => cycleAdvFilter(field.key, field.opts)}
                                >
                                    <Text style={styles.label}>{field.label}</Text>
                                    <View style={styles.pickerBox}>
                                        <Text style={styles.pickerText}>{t(advFilters[field.key])}</Text>
                                        <Icon name="chevron-down" size={16} color={COLORS.textSub} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8} onPress={handleSearch}>
                    <LinearGradient
                        colors={[COLORS.ctaGradientStart, COLORS.ctaGradientEnd]}
                        style={styles.searchBtnGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <Text style={styles.searchBtnText}>
                                {searchMode === 'normal' ? t('SEARCH_BTN') : t('SUBMIT')}
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* ── Modals ─────────────────────────────────────────── */}
            <ModalSelector
                visible={ageModalVisible}
                options={ageOptions}
                selectedValue={filters.age}
                onSelect={(val) => setFilters(prev => ({ ...prev, age: val }))}
                onClose={() => setAgeModalVisible(false)}
                title={t('AGE')}
            />
            <ModalSelector
                visible={ageFromModalVisible}
                options={ageOptions}
                selectedValue={advFilters.ageFrom}
                onSelect={handleAgeFromSelect}              // ← validates range
                onClose={() => setAgeFromModalVisible(false)}
                title={`${t('AGE')} (From)`}
            />
            <ModalSelector
                visible={ageToModalVisible}
                options={ageOptions}
                selectedValue={advFilters.ageTo}
                onSelect={handleAgeToSelect}                // ← validates range
                onClose={() => setAgeToModalVisible(false)}
                title={`${t('AGE')} (To)`}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchWrapper: {
        marginHorizontal: 0,
        backgroundColor: '#FDF1DE',
        borderRadius: scale(20),
        padding: scale(20),
        marginBottom: scale(30),
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    topNavBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 0,
    },
    navLeft: {
        flexDirection: 'row',
    },
    navTab: {
        backgroundColor: '#EAEAEA',
        paddingVertical: scale(8),
        paddingHorizontal: scale(15),
        marginRight: scale(5),
        borderTopLeftRadius: scale(5),
        borderTopRightRadius: scale(5),
    },
    navTabActive: {
        backgroundColor: '#DDD',
    },
    navTabText: {
        color: '#666',
        fontSize: moderateScale(12),
    },
    navTabTextActive: {
        color: '#333',
        fontWeight: 'bold',
    },
    searchTitleRow: {
        marginBottom: scale(20),
    },
    searchWidgetTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#B71C1C',
    },
    searchWidgetSubtitle: {
        fontSize: moderateScale(14),
        color: COLORS.textMain,
        marginTop: scale(5),
        lineHeight: moderateScale(20),
    },
    formGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: scale(10),
    },
    inputGroup: {
        width: '48%',
        marginBottom: scale(10),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginBottom: scale(6),
    },
    pickerBox: {
        backgroundColor: COLORS.white,
        borderRadius: scale(10),
        padding: scale(10),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        minHeight: 45,
    },
    pickerText: {
        color: COLORS.textMain,
        fontSize: moderateScale(13),
    },
    fullWidthInputGroup: {
        width: '100%',
        marginBottom: scale(12),
    },
    textInputBox: {
        backgroundColor: COLORS.white,
        borderRadius: scale(10),
        padding: scale(12),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        color: '#333',
        minHeight: 45,
    },
    sectionHeaderTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: scale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
        paddingBottom: scale(5),
        marginTop: scale(10),
    },
    searchBtn: {
        marginTop: scale(20),
        borderRadius: scale(25),
        overflow: 'hidden',
    },
    searchBtnGradient: {
        paddingVertical: scale(14),
        alignItems: 'center',
    },
    searchBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: moderateScale(16),
    },
});

export default SearchFilter;