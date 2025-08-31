import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ApiKey, ChartDataPoint } from '../types';
import {
    CogIcon, DashboardIcon, WarningIcon, LockIcon, ChartIcon, KeyIcon, CheckCircleIcon, XCircleIcon,
    ClockIcon, HourglassIcon, CalendarIcon, BarChartIcon, InfoIcon, ChevronDownIcon, SearchIcon
} from './Icons';

// --- MOCK DATA ---
const MOCK_CHART_DATA: ChartDataPoint[] = [
    { time: '00:00', success: 23, failure: 3 }, { time: '02:00', success: 35, failure: 5 }, { time: '04:00', success: 45, failure: 2 }, { time: '06:00', success: 50, failure: 8 }, { time: '08:00', success: 65, failure: 12 }, { time: '10:00', success: 72, failure: 4 }, { time: '12:00', success: 80, failure: 1 }, { time: '14:00', success: 68, failure: 6 }, { time: '16:00', success: 75, failure: 3 }, { time: '18:00', success: 88, failure: 7 }, { time: '20:00', success: 95, failure: 10 }, { time: '22:00', success: 110, failure: 5 },
];

const NOTEWORTHY_KEYS: ApiKey[] = [
    { id: '1', key: 'N/A', status: 'invalid', errorCode: 429, errorStatus: 'undefined', failureCount: 15 },
    { id: '2', key: 'N/A', status: 'invalid', errorCode: 429, errorStatus: 'undefined', failureCount: 12 },
];

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
    const [activeTimeRange, setActiveTimeRange] = useState('24h');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    
    React.useEffect(() => {
        const timer = setTimeout(() => setChartData(MOCK_CHART_DATA), 1000);
        return () => clearTimeout(timer);
    }, []);

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
                    <SectionHeader icon={<LockIcon className="w-5 h-5" />} title="Key Statistics" meta="Total: 0" />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <StatCard icon={<KeyIcon className="w-6 h-6" />} value="0" label="Total Keys" iconBgColor="bg-tertiary-container" iconTextColor="text-on-tertiary-container" />
                        <StatCard icon={<CheckCircleIcon className="w-6 h-6" />} value="0" label="Valid Keys" iconBgColor="bg-primary-container" iconTextColor="text-on-primary-container" />
                        <StatCard icon={<XCircleIcon className="w-6 h-6" />} value="0" label="Invalid Keys" iconBgColor="bg-error-container" iconTextColor="text-on-error-container" />
                    </div>
                </Card>
                <Card>
                    <SectionHeader icon={<ChartIcon className="w-5 h-5" />} title="API Call Statistics" meta="This Month: 0" />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <StatCard icon={<ClockIcon className="w-6 h-6" />} value="0" label="1-min calls" iconBgColor="bg-tertiary-container" iconTextColor="text-on-tertiary-container" />
                        <StatCard icon={<HourglassIcon className="w-6 h-6" />} value="0" label="1-hour calls" iconBgColor="bg-primary-container" iconTextColor="text-on-primary-container" />
                        <StatCard icon={<CalendarIcon className="w-6 h-6" />} value="0" label="24-hour calls" iconBgColor="bg-secondary-container" iconTextColor="text-on-secondary-container" />
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

            <KeyListSection title="Noteworthy Keys" icon={<InfoIcon className="w-5 h-5 text-secondary" />} count={NOTEWORTHY_KEYS.length} defaultOpen={true}>
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
                        {NOTEWORTHY_KEYS.map(key => (
                            <div key={key.id} className="flex items-center gap-4 p-3 hover:bg-surface-container rounded-lg transition-colors">
                                <input type="checkbox" className="w-5 h-5 bg-surface-container rounded border-outline focus:ring-primary text-primary" />
                                <span className="font-mono text-sm flex-1 text-on-surface-variant">{key.key}</span>
                                <span className="text-xs font-medium bg-error-container text-on-error-container px-2.5 py-1 rounded-full">{key.errorCode}: {key.errorStatus}</span>
                                <div className="flex items-center gap-1">
                                    <button className="px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-full">Verify</button>
                                    <button className="px-3 py-2 text-xs font-medium text-secondary hover:bg-secondary/10 rounded-full">Details</button>
                                    <button className="px-3 py-2 text-xs font-medium text-secondary hover:bg-secondary/10 rounded-full">Copy</button>
                                    <button className="px-3 py-2 text-xs font-medium text-error hover:bg-error/10 rounded-full">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </KeyListSection>

            <KeyListSection title="Valid Keys List" icon={<CheckCircleIcon className="w-5 h-5 text-primary" />} count={0}>
                <div className="text-center py-8 text-on-surface-variant">Error loading keys.</div>
            </KeyListSection>
            
            <KeyListSection title="Invalid Keys List" icon={<XCircleIcon className="w-5 h-5 text-error" />} count={0}>
                <div className="text-center py-8 text-on-surface-variant">Error loading keys.</div>
            </KeyListSection>
        </div>
    );
};

export default Dashboard;
