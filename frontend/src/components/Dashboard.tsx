import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ApiKey, ChartDataPoint } from '../types';
import {
    CogIcon, DashboardIcon, WarningIcon, LockIcon, ChartIcon, KeyIcon, CheckCircleIcon, XCircleIcon,
    ClockIcon, HourglassIcon, CalendarIcon, BarChartIcon, InfoIcon, ChevronDownIcon, SearchIcon
} from './Icons';

// --- API HELPER ---
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null; // Indicate success with no content for DELETE etc.
    }

    let responseData;
    try {
      // Clone the response to allow reading it multiple times if needed (e.g., for text fallback)
      const clonedResponse = response.clone();
      responseData = await response.json();
    } catch (e) {
      // If JSON parsing fails, try to get text, especially if response wasn't ok
      if (!response.ok) {
        const textResponse = await response.text(); // Use original response for text
        throw new Error(
          textResponse ||
            `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }
      // If response is ok but not JSON, maybe return raw text or handle differently
      console.warn("Response was not JSON for URL:", url);
      // Consider returning text or null based on expected non-JSON success cases
      return await response.text(); // Example: return text for non-JSON success
    }

    if (!response.ok) {
      // Prefer error message from API response body (already parsed as JSON)
      const message =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
        `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }

    return responseData; // Return parsed JSON data
  } catch (error) {
    console.error(
      "API Call Failed:",
      error.message,
      "URL:",
      url,
      "Options:",
      options
    );
    // Re-throw the error so the calling function knows the operation failed
    // Add more context if possible
    throw new Error(`API请求失败: ${error.message}`);
  }
}

// --- DEBOUNCE HOOK ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}


// --- MD3 HELPER COMPONENTS ---

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    iconBgColor: string;
    iconTextColor: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon, value, label, iconBgColor, iconTextColor }) => (
    <div className="bg-surface-container rounded-xl p-4 flex-1 flex items-center gap-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-full ${iconBgColor} ${iconTextColor}`}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-semibold text-on-surface">{value}</div>
            <div className="text-sm text-on-surface-variant">{label}</div>
        </div>
    </div>
);

interface SegmentedButtonProps {
    options: { id: string; label: string; icon?: React.ReactNode }[];
    active: string;
    onSelect: (id: string) => void;
}
const SegmentedButton: React.FC<SegmentedButtonProps> = ({ options, active, onSelect }) => (
    <div className="flex bg-surface-container rounded-full p-1">
        {options.map((opt) => (
            <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 flex items-center justify-center gap-2 relative
                    ${active === opt.id ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-on-surface/10'}`}
            >
                {opt.icon}
                <span>{opt.label}</span>
            </button>
        ))}
    </div>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}
const Card: React.FC<CardProps> = ({ children, className = '', padding = 'p-4 sm:p-6' }) => (
    <div className={`bg-surface-container-low rounded-3xl ${padding} ${className}`}>
        {children}
    </div>
);

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    meta?: string;
}
const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, meta }) => (
    <div className="flex items-center justify-between text-on-surface-variant mb-4">
        <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-base font-medium text-on-surface">{title}</h2>
        </div>
        {meta && <span className="text-sm">{meta}</span>}
    </div>
);

interface KeyListSectionProps {
    title: string;
    icon: React.ReactNode;
    count: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}
const KeyListSection: React.FC<KeyListSectionProps> = ({ title, icon, count, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card padding="p-0">
            <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-medium text-on-surface">{title} ({count})</span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="px-4 pb-4">{children}</div>}
        </Card>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
const Dashboard: React.FC = () => {
    const [activeNav, setActiveNav] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [activeTimeRange, setActiveTimeRange] = useState('24h');
    
    const [validKeys, setValidKeys] = useState<{ [key: string]: number }>({});
    const [invalidKeys, setInvalidKeys] = useState<{ [key: string]: number }>({});
    const [noteworthyKeys, setNoteworthyKeys] = useState<ApiKey[]>([]);

    const [validKeysPage, setValidKeysPage] = useState(1);
    const [invalidKeysPage, setInvalidKeysPage] = useState(1);
    const [validKeysTotalPages, setValidKeysTotalPages] = useState(1);
    const [invalidKeysTotalPages, setInvalidKeysTotalPages] = useState(1);

    const [validKeysSearch, setValidKeysSearch] = useState('');
    const [invalidKeysSearch, setInvalidKeysSearch] = useState('');
    const debouncedValidKeysSearch = useDebounce(validKeysSearch, 500);
    const debouncedInvalidKeysSearch = useDebounce(invalidKeysSearch, 500);

    const [selectedValidKeys, setSelectedValidKeys] = useState<string[]>([]);
    const [selectedInvalidKeys, setSelectedInvalidKeys] = useState<string[]>([]);


    const fetchKeys = useCallback(async (type: 'valid' | 'invalid', page: number, search: string) => {
        try {
            const params = new URLSearchParams({
                status: type,
                page: page.toString(),
                limit: '10',
                search: search,
            });
            const data = await fetchAPI(`/api/keys?${params.toString()}`);
            if (type === 'valid') {
                setValidKeys(data.keys);
                setValidKeysTotalPages(data.total_pages);
            } else {
                setInvalidKeys(data.keys);
                setInvalidKeysTotalPages(data.total_pages);
            }
        } catch (error) {
            console.error(`Failed to fetch ${type} keys:`, error);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const statsData = await fetchAPI('/api/stats/details?period=all');
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    const fetchChartData = useCallback(async (period: string) => {
        try {
            const chartData = await fetchAPI(`/api/stats/details?period=${period}`);
            setChartData(chartData.timeline);
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
        }
    }, []);

    useEffect(() => {
        fetchChartData(activeTimeRange);
    }, [activeTimeRange, fetchChartData]);

    const fetchAllData = useCallback(async () => {
        fetchKeys('valid', validKeysPage, debouncedValidKeysSearch);
        fetchKeys('invalid', invalidKeysPage, debouncedInvalidKeysSearch);
        fetchStats();
        try {
            const noteworthyKeysData = await fetchAPI('/api/stats/attention-keys?status_code=429&limit=10');
            setNoteworthyKeys(noteworthyKeysData);
        } catch (error) {
            console.error("Failed to fetch noteworthy keys:", error);
        }
    }, [fetchKeys, fetchStats, validKeysPage, debouncedValidKeysSearch, invalidKeysPage, debouncedInvalidKeysSearch]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        if (activeNav === 'config') {
            window.location.href = '/config';
        } else if (activeNav === 'logs') {
            window.location.href = '/logs';
        }
    }, [activeNav]);

    const handleVerifyKey = async (key: string) => {
        try {
            await fetchAPI(`/gemini/v1beta/verify-key/${key}`, { method: 'POST' });
            fetchAllData();
        } catch (error) {
            console.error("Failed to verify key:", error);
        }
    };

    const handleDeleteKey = async (key: string) => {
        try {
            await fetchAPI(`/api/config/keys/${key}`, { method: 'DELETE' });
            fetchAllData();
        } catch (error) {
            console.error("Failed to delete key:", error);
        }
    };

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
    };

    const handleSelectKey = (key: string, type: 'valid' | 'invalid') => {
        const selectedSetter = type === 'valid' ? setSelectedValidKeys : setSelectedInvalidKeys;
        selectedSetter(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const handleSelectAllKeys = (type: 'valid' | 'invalid') => {
        const keys = type === 'valid' ? Object.keys(validKeys) : Object.keys(invalidKeys);
        const selected = type === 'valid' ? selectedValidKeys : selectedInvalidKeys;
        const selectedSetter = type === 'valid' ? setSelectedValidKeys : setSelectedInvalidKeys;
        if (selected.length === keys.length) {
            selectedSetter([]);
        } else {
            selectedSetter(keys);
        }
    };

    const handleBatchDelete = async (type: 'valid' | 'invalid') => {
        const selectedKeys = type === 'valid' ? selectedValidKeys : selectedInvalidKeys;
        try {
            await fetchAPI('/api/config/keys/delete-selected', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keys: selectedKeys }),
            });
            fetchAllData();
        } catch (error) {
            console.error("Failed to batch delete keys:", error);
        }
    };
    
    const navOptions = useMemo(() => [
        { id: 'config', label: 'Configuration', icon: <CogIcon className="w-5 h-5" /> },
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
        { id: 'logs', label: 'Error Log', icon: <WarningIcon className="w-5 h-5" /> },
    ], []);

    const timeRangeOptions = useMemo(() => [
        { id: '1h', label: '1H' }, { id: '8h', label: '8H' }, { id: '24h', label: '24H' },
    ], []);
    
    return (
        <div className="flex flex-col gap-6">
            <div className="max-w-md">
                <SegmentedButton options={navOptions} active={activeNav} onSelect={setActiveNav} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <SectionHeader icon={<LockIcon className="w-5 h-5" />} title="Key Statistics" meta={`Total: ${Object.keys(validKeys).length + Object.keys(invalidKeys).length}`} />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <StatCard icon={<KeyIcon className="w-6 h-6" />} value={`${Object.keys(validKeys).length + Object.keys(invalidKeys).length}`} label="Total Keys" iconBgColor="bg-tertiary-container" iconTextColor="text-on-tertiary-container" />
                        <StatCard icon={<CheckCircleIcon className="w-6 h-6" />} value={`${Object.keys(validKeys).length}`} label="Valid Keys" iconBgColor="bg-primary-container" iconTextColor="text-on-primary-container" />
                        <StatCard icon={<XCircleIcon className="w-6 h-6" />} value={`${Object.keys(invalidKeys).length}`} label="Invalid Keys" iconBgColor="bg-error-container" iconTextColor="text-on-error-container" />
                    </div>
                </Card>
                <Card>
                    <SectionHeader icon={<ChartIcon className="w-5 h-5" />} title="API Call Statistics" meta={`This Month: ${stats ? stats.calls_month.total : 0}`} />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <StatCard icon={<ClockIcon className="w-6 h-6" />} value={stats ? stats.calls_1m.total : "0"} label="1-min calls" iconBgColor="bg-tertiary-container" iconTextColor="text-on-tertiary-container" />
                        <StatCard icon={<HourglassIcon className="w-6 h-6" />} value={stats ? stats.calls_1h.total : "0"} label="1-hour calls" iconBgColor="bg-primary-container" iconTextColor="text-on-primary-container" />
                        <StatCard icon={<CalendarIcon className="w-6 h-6" />} value={stats ? stats.calls_24h.total : "0"} label="24-hour calls" iconBgColor="bg-secondary-container" iconTextColor="text-on-secondary-container" />
                    </div>
                </Card>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <BarChartIcon className="w-5 h-5 text-on-surface-variant" />
                        <h2 className="text-base font-medium text-on-surface">Call Trend Chart</h2>
                    </div>
                    <div className="w-full sm:w-auto">
                      <SegmentedButton options={timeRangeOptions} active={activeTimeRange} onSelect={setActiveTimeRange} />
                    </div>
                </div>
                <div className="h-72">
                    {chartData.length === 0 ? (
                         <div className="flex items-center justify-center h-full text-on-surface-variant">Loading chart data...</div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-color-outline-variant)" opacity={0.5} />
                            <XAxis dataKey="time" stroke="var(--tw-color-on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--tw-color-on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--tw-color-surface-container-high)',
                                    borderColor: 'var(--tw-color-outline)',
                                    borderRadius: '12px',
                                }}
                                labelStyle={{ color: 'var(--tw-color-on-surface-variant)' }}
                                itemStyle={{fontWeight: 500}}
                            />
                            <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}} />
                            <Line type="monotone" name="Success" dataKey="success" stroke="var(--tw-color-primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: 'var(--tw-color-primary)' }} />
                            <Line type="monotone" name="Failure" dataKey="failure" stroke="var(--tw-color-error)" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: 'var(--tw-color-error)' }} />
                        </LineChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </Card>

            <KeyListSection title="Noteworthy Keys" icon={<InfoIcon className="w-5 h-5 text-secondary" />} count={noteworthyKeys.length} defaultOpen={true}>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant pb-4">
                        <button className="px-4 py-2 text-sm bg-secondary-container text-on-secondary-container rounded-full">429</button>
                        <button className="px-4 py-2 text-sm text-on-surface-variant hover:bg-on-surface/10 border border-outline rounded-full">403</button>
                        <button className="px-4 py-2 text-sm text-on-surface-variant hover:bg-on-surface/10 border border-outline rounded-full">400</button>
                        <input type="text" placeholder="Custom" className="bg-surface-container border border-outline px-3 py-2 text-sm rounded-lg w-28 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary" />
                        <button className="px-4 py-2 text-sm bg-primary text-on-primary rounded-full font-medium">Query</button>
                        <div className="flex-grow"></div>
                        <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <input type="checkbox" className="w-5 h-5 bg-surface-container rounded border-outline focus:ring-primary text-primary" /> Select All
                        </label>
                    </div>
                     <div className="flex flex-col gap-2">
                        {noteworthyKeys.map(key => (
                            <div key={key.id} className="flex items-center gap-4 p-3 hover:bg-surface-container rounded-lg transition-colors">
                                <input type="checkbox" className="w-5 h-5 bg-surface-container rounded border-outline focus:ring-primary text-primary" />
                                <span className="font-mono text-sm flex-1 text-on-surface-variant">{key.key}</span>
                                <span className="text-xs font-medium bg-error-container text-on-error-container px-2.5 py-1 rounded-full">{key.errorCode}: {key.errorStatus}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleVerifyKey(key.key)} className="px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-full">Verify</button>
                                    <button className="px-3 py-2 text-xs font-medium text-secondary hover:bg-secondary/10 rounded-full">Details</button>
                                    <button onClick={() => handleCopyKey(key.key)} className="px-3 py-2 text-xs font-medium text-secondary hover:bg-secondary/10 rounded-full">Copy</button>
                                    <button onClick={() => handleDeleteKey(key.key)} className="px-3 py-2 text-xs font-medium text-error hover:bg-error/10 rounded-full">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </KeyListSection>

            <KeyListSection title="Valid Keys List" icon={<CheckCircleIcon className="w-5 h-5 text-primary" />} count={Object.keys(validKeys).length}>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <input type="text" placeholder="Search keys..." value={validKeysSearch} onChange={e => setValidKeysSearch(e.target.value)} className="bg-surface-container border border-outline px-3 py-2 text-sm rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary" />
                        <button onClick={() => handleBatchDelete('valid')} className="px-4 py-2 text-sm bg-error text-on-error rounded-full font-medium">Delete Selected</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" onChange={() => handleSelectAllKeys('valid')} checked={selectedValidKeys.length === Object.keys(validKeys).length && Object.keys(validKeys).length > 0} className="w-5 h-5 bg-surface-container rounded border-outline focus:ring-primary text-primary" />
                        <span>Select All</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {Object.entries(validKeys).map(([key, fail_count]) => (
                            <div key={key} className="flex items-center gap-4 p-3 hover:bg-surface-container rounded-lg transition-colors">
                                <input type="checkbox" checked={selectedValidKeys.includes(key)} onChange={() => handleSelectKey(key, 'valid')} className="w-5 h-5 bg-surface-container rounded border-outline focus:ring-primary text-primary" />
                                <span className="font-mono text-sm flex-1 text-on-surface-variant">{key}</span>
                                <span className="text-xs font-medium bg-error-container text-on-error-container px-2.5 py-1 rounded-full">Fails: {fail_count}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleVerifyKey(key)} className="px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-full">Verify</button>
                                    <button className="px-3 py-2 text-xs font-medium text-secondary hover:bg-secondary/10 rounded-full">Details</button>
                                    <button onClick={() => handleCopyKey(key)} className="px-3 py-2 text-xs font-medium text-secondary hover:bg-secondary/10 rounded-full">Copy</button>
                                    <button onClick={() => handleDeleteKey(key)} className="px-3 py-2 text-xs font-medium text-error hover:bg-error/10 rounded-full">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <button onClick={() => setValidKeysPage(p => Math.max(1, p - 1))} disabled={validKeysPage === 1} className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-50">Prev</button>
                        <span>Page {validKeysPage} of {validKeysTotalPages}</span>
                        <button onClick={() => setValidKeysPage(p => Math.min(validKeysTotalPages, p + 1))} disabled={validKeysPage === validKeysTotalPages} className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-50">Next</button>
                    </div>
                </div>
            </KeyListSection>
            
            <KeyListSection title="Invalid Keys List" icon={<XCircleIcon className="w-5 h-5 text-error" />} count={Object.keys(invalidKeys).length}>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <input type="text" placeholder="Search keys..." value={invalidKeysSearch} onChange={e => setInvalidKeysSearch(e.target.value)} className="bg-surface-container border border-outline px-3 py-2 text-sm rounded-lg w-full focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary" />
                        <button onClick={() => handleBatchDelete('invalid')} className="px-4 py-2 text-sm bg-error text-on-error rounded-full font-medium">Delete Selected</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" onChange={() => handleSelectAllKeys('invalid')} checked={selectedInvalidKeys.length === Object.keys(invalidKeys).length && Object.keys(invalidKeys).length > 0} className="w-5 h-5 bg-surface-container rounded border-outline focus:ring-primary text-primary" />
                        <span>Select All</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {Object.entries(invalidKeys).map(([key, fail_count]) => (
                            <div key={key} className="flex items-center gap-4 p-3 hover:bg-surface-container rounded-lg transition-colors">
                                <input type="checkbox" checked={selectedInvalidKeys.includes(key)} onChange={() => handleSelectKey(key, 'invalid')} className="w-5 h-5 bg-surface-container rounded border-outline focus:ring-primary text-primary" />
                                <span className="font-mono text-sm flex-1 text-on-surface-variant">{key}</span>
                                <span className="text-xs font-medium bg-error-container text-on-error-container px-2.5 py-1 rounded-full">Fails: {fail_count}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleVerifyKey(key)} className="px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-full">Verify</button>
                                    <button className="px-3 py-2 text-xs font-medium text-secondary hover:bg-secondary/10 rounded-full">Details</button>
                                    <button onClick={() => handleCopyKey(key)} className="px-3 py-2 text-xs font-medium text-secondary hover:bg-secondary/10 rounded-full">Copy</button>
                                    <button onClick={() => handleDeleteKey(key)} className="px-3 py-2 text-xs font-medium text-error hover:bg-error/10 rounded-full">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <button onClick={() => setInvalidKeysPage(p => Math.max(1, p - 1))} disabled={invalidKeysPage === 1} className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-50">Prev</button>
                        <span>Page {invalidKeysPage} of {invalidKeysTotalPages}</span>
                        <button onClick={() => setInvalidKeysPage(p => Math.min(invalidKeysTotalPages, p + 1))} disabled={invalidKeysPage === invalidKeysTotalPages} className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-50">Next</button>
                    </div>
                </div>
            </KeyListSection>
        </div>
    );
};

export default Dashboard;
