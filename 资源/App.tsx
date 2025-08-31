import React from 'react';

const GoogleLogo = () => (
    <svg className="w-8 h-8" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#34A853" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l5.657,5.657C41.386,36.251,44,30.65,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FBBC05" d="M10.21,29.21l5.657-5.657C14.809,22.18,14,20.18,14,18s0.809-4.18,1.867-5.553l-5.657-5.657C8.534,9.63,7,13.6,7,18s1.534,8.37,4.21,11.21z"></path>
        <path fill="#EA4335" d="M24,48c5.268,0,10.046-1.947,13.59-5.18l-5.657-5.657C30.166,38.231,27.23,39,24,39c-4.453,0-8.289-2.344-10.142-5.787l-5.657,5.657C11.334,44.951,17.25,48,24,48z"></path>
        <path fill="none" d="M7,18h34v14H7z"></path>
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);


export default function App() {
    return (
        <div className="text-neutral-200 font-sans flex flex-col min-h-screen">
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md mx-auto bg-[#202124] rounded-2xl p-12">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <GoogleLogo />
                        </div>
                        <h1 className="text-3xl font-normal text-neutral-100 mb-2">登录</h1>
                        <p className="text-base text-neutral-200">使用您的 Google 帐号</p>
                    </div>

                    <form>
                        <div className="relative mb-6">
                            <input
                                id="email"
                                name="email"
                                type="text"
                                className="block px-3.5 pb-2.5 pt-4 w-full text-sm text-neutral-100 bg-transparent rounded-lg border border-neutral-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-400 focus:border-2 peer"
                                placeholder=" "
                            />
                            <label
                                htmlFor="email"
                                className="absolute text-sm text-neutral-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#202124] px-2 peer-focus:px-2 peer-focus:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            >
                                邮箱或电话号码
                            </label>
                        </div>
                        <div className="text-left mb-10">
                            <button type="button" className="text-sm font-semibold text-blue-400 rounded-full px-3 py-1.5 -ml-3 hover:bg-blue-400/10 transition-colors duration-300">
                                忘记了邮箱？
                            </button>
                        </div>

                        <div className="text-sm text-neutral-400 mb-12">
                            <p>您用的不是自己的电脑？请使用访客模式无痕登录。</p>
                            <a href="#" className="text-blue-400 font-semibold hover:text-blue-300">详细了解如何使用访客模式</a>
                        </div>

                        <div className="flex items-center justify-between">
                            <button type="button" className="text-sm font-semibold text-blue-400 rounded-full px-4 py-2 hover:bg-blue-400/10 transition-colors duration-300">
                                创建账号
                            </button>
                            <button type="submit" className="bg-[#8ab4f8] text-[#202124] font-semibold text-sm py-2.5 px-6 rounded-full hover:bg-[#a1c5f8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#202124] focus:ring-blue-500 transition-colors duration-300">
                                下一步
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <footer className="px-4 py-6 md:px-10 text-xs text-neutral-400">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="relative">
                       <button className="flex items-center space-x-2 hover:text-neutral-300">
                           <span>简体中文</span>
                           <ChevronDownIcon />
                       </button>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-neutral-300">帮助</a>
                        <a href="#" className="hover:text-neutral-300">隐私权</a>
                        <a href="#" className="hover:text-neutral-300">条款</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}