/* eslint-disable @next/next/no-img-element */
export default function Home() {
    return (
        <>
            {/* Navigation */}
            <nav className='sticky top-0 z-50 w-full border-b border-brand-darker/50 bg-brand-dark/95 backdrop-blur-sm'>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex h-16 items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <div className='flex items-center justify-center'>
                                <img
                                    src='/funkshan_logo_white.svg'
                                    alt='Funkshan Logo'
                                    className='w-35'
                                />
                            </div>
                        </div>
                        <div className='hidden md:flex items-center gap-8'>
                            <a
                                className='text-sm font-medium text-gray-300 hover:text-white transition-colors'
                                href='#features'
                            >
                                Features
                            </a>
                            <a
                                className='text-sm font-medium text-gray-300 hover:text-white transition-colors'
                                href='#reviews'
                            >
                                Reviews
                            </a>
                            <button className='bg-primary hover:bg-orange-600 text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors'>
                                Download
                            </button>
                        </div>
                        <div className='md:hidden text-white'>
                            <span className='material-symbols-outlined cursor-pointer'>
                                menu
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className='relative overflow-hidden pt-12 pb-16 lg:pt-24 lg:pb-32'>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-12 lg:grid-cols-2 lg:gap-8 items-center'>
                        <div className='flex flex-col items-start gap-6 max-w-2xl'>
                            <div className='inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary'>
                                <span className='material-symbols-outlined mr-1 text-[18px]'>
                                    bolt
                                </span>
                                The new standard for social events
                            </div>
                            <h1 className='text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl xl:text-7xl'>
                                Invite.
                                <br />
                                <span className='text-primary'>Socialize.</span>
                                <br />
                                Memorialize.
                            </h1>
                            <p className='text-lg leading-relaxed text-gray-300 max-w-lg'>
                                Organize everything from casual hangouts to
                                major galas in one app. The future of event
                                planning is here, designed for modern
                                connections.
                            </p>
                            <div className='flex flex-wrap gap-4 pt-4'>
                                <button className='flex items-center gap-3 bg-white text-brand-dark px-6 py-3.5 rounded-lg font-bold hover:bg-gray-100 transition-colors'>
                                    <img
                                        alt='Apple'
                                        className='h-6 w-6 invert'
                                        src='https://lh3.googleusercontent.com/aida-public/AB6AXuD4qvB2_s_ZSJXpN2m6DkgBz6UACWPZguSSLXlq8xUzysiUhR_FD4bzTM7Jmvd_StRzpRwqwVq8a2X0iFd_RqjJN8zwpQaSjWdpEK-vGGzHg7dBbYeS8SQZiw3lvYRhHBLEvPDiOc26BQpc8LRZJzMPk_P87qovGrPhi9JGMQ0gGyuCtZSSKVVgWNg92u95CBWLphmT5oKs2WcbKAwvZOs5dQZ63WN0_LSd9rlrNfL3lajq3tjWDfoYyzNuTKCDZ2nqtzEIyZdfznZa'
                                    />
                                    <span>App Store</span>
                                </button>
                                <button className='flex items-center gap-3 bg-brand-darker border border-gray-700 text-white px-6 py-3.5 rounded-lg font-bold hover:bg-gray-800 transition-colors'>
                                    <img
                                        alt='Android'
                                        className='h-6 w-6'
                                        src='https://lh3.googleusercontent.com/aida-public/AB6AXuD6imjTeFBk9uADY8YttZPPWDb532CysGUnndUmTz4I2wfKln-1dOqR6FSU1ffhWzsHgdI76HAlsRjYpX9cTwedZW_CQ8F_hPIQSXqTvZ_idDfjbBFAObmcwVD8XoKmw_9-jSCF2Vz2eiLFP9o6K9y9UBhoW4l3gxNBYXvfxqoyGhWz2PfI7vkjPBFRJORbh03TR9NEOgvrMDsC_CjFlHAmBGm-HLiOC4mWmpE8YikZacJScAM6gsLZ7XyY0P6pduULH44oe0oSDuLR'
                                    />
                                    <span>Google Play</span>
                                </button>
                            </div>
                        </div>
                        <div className='relative mx-auto w-full max-w-[400px] lg:max-w-none lg:ml-auto perspective-1000'>
                            <div className='absolute -top-24 -right-24 h-[400px] w-[400px] rounded-full bg-primary/20 blur-3xl lg:h-[600px] lg:w-[600px]'></div>
                            <div className='relative z-10 mx-auto w-full max-w-[360px] lg:-rotate-6 lg:hover:rotate-0 transition-transform duration-500 ease-out'>
                                <div className='overflow-hidden rounded-[2.5rem] border-8 border-brand-darker bg-brand-darker shadow-2xl'>
                                    <div className='h-[700px] w-full bg-brand-dark flex flex-col relative'>
                                        <div className='px-6 pt-12 pb-4 flex justify-between items-center bg-brand-darker/50'>
                                            <h3 className='font-bold text-xl'>
                                                My Events
                                            </h3>
                                            <span className='material-symbols-outlined'>
                                                notifications
                                            </span>
                                        </div>
                                        <div className='flex-1 p-4 space-y-4 overflow-hidden'>
                                            <div className='rounded-xl bg-linear-to-br from-primary to-orange-600 p-5 text-white shadow-lg relative overflow-hidden group'>
                                                <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl'></div>
                                                <p className='text-xs font-medium opacity-80 uppercase tracking-wider mb-1'>
                                                    Tonight
                                                </p>
                                                <h4 className='text-2xl font-bold mb-2'>
                                                    Sarah&apos;s 30th Birthday
                                                    Bash
                                                </h4>
                                                <div className='flex -space-x-2 mt-4'>
                                                    <div
                                                        className='w-8 h-8 rounded-full border-2 border-primary bg-gray-300 bg-cover bg-center'
                                                        style={{
                                                            backgroundImage:
                                                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBXLfQ2BZknjsWUasiM1JS2B_qUg6ngjgK8JkaTVHJTWipjANfF28RWWFYn75tre4RbTAi6ayW0wEBgUQEkdwRwOsu1_amcnyqNbh8PCOYD7MH9gQsUbA_ByU-Zw-uK8F6wHZjgfxN6xkBnRN4KEto4T-zxOZzZAlkEsO3oQQwE0C49epHAxxE4x8phrDF2-Aq95XJXbkP9C2rdcHzM_M-TEa7HqnSDRurRK6ardawRKRVetj69uAGdmd76uhG0VYWLKUwQkFlW4cyc")',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className='w-8 h-8 rounded-full border-2 border-primary bg-gray-400 bg-cover bg-center'
                                                        style={{
                                                            backgroundImage:
                                                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8NAzAJ5wgZRat7VR-9HOCvujqZvC6aJ9Of9mq8Yj7USrXeQ5dWjGXgIql5Hy0zAWHMNOdz7VScYhidY4EyzcNqFrfveLVCwgweZacimFTiTfsAgl2sCsF0OBs9vQjKOzzyIgs6ytQanOuMFvRkhsLi3Wupr1OJmBEeW4w11z_ROmR8yy5OcovFWcFWzr1N2E6K-rbaO4TtoL5H1z8gLzC689uxWp2pIBvJiTN4Q_XORsdO89Gv8-S_ubIMgGIWhUgPsCcOzLaQT25")',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className='w-8 h-8 rounded-full border-2 border-primary bg-gray-500 bg-cover bg-center'
                                                        style={{
                                                            backgroundImage:
                                                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpKVqJCDoz6ING64H_28ouydt6fFl_iWVzL-cxAvMp2qiFYrRTmvIw_g19tLf_tSAA00YfAKfhzJY7YZxSLxBNXTe7Ielkb0OQEzG1imwnnIOmfWrwC08o0ldCgJQC6pt_8rR4gMoUoAnFNwJUQxD3RDxHPiZ_2CsZRqfJqvcz1c48weVdUXY-kYfutS0wh1ZCoRDpc6cYs3AyrylU6H_QFPaLTcjbu1WFgra0AlnxDLAOyZa6lfSpYzzOn3G3QyVYvxy3RCG9TPxO")',
                                                        }}
                                                    ></div>
                                                    <div className='w-8 h-8 rounded-full border-2 border-primary bg-white flex items-center justify-center text-[10px] font-bold text-primary'>
                                                        +12
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='rounded-xl bg-[#2a3749] p-4 flex gap-4 items-center border border-white/5'>
                                                <div
                                                    className='h-14 w-14 rounded-lg bg-cover bg-center shrink-0'
                                                    style={{
                                                        backgroundImage:
                                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIqXEDg62V4JL_h2XAyXgGJAngZCp4RvLCo5m-1cu1HgRlUk8hAI-q22s6uptCx9hrh-Fxw63JABwNDfEiAGO7NqeaywuAUhnPB9-xKJJmsB0noefsikKILL8wNgWpN0k8We9Tmi-182m3huF0n-kuiNL3Z9IzZg9NW9ANQd2OKM5270zblJD6SpfDydxgalbVtJSJN2NH2LHd_SjothPYSaGsbAVvSANwayCE8nsw2_xyoeE3HwLb8w6kjAP7NL3cqpBYbPZmMDUG")',
                                                    }}
                                                ></div>
                                                <div>
                                                    <h5 className='font-bold text-white'>
                                                        Rooftop Jazz Night
                                                    </h5>
                                                    <p className='text-xs text-gray-400'>
                                                        Sat, Oct 24 • 8:00 PM
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='rounded-xl bg-[#2a3749] p-4 flex gap-4 items-center border border-white/5'>
                                                <div
                                                    className='h-14 w-14 rounded-lg bg-cover bg-center shrink-0'
                                                    style={{
                                                        backgroundImage:
                                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmzQBLdT6_v4__qu6lKz67r8VrTUVCEE9o7uzuLIHxBmv4K6UjqZLTbeOnMnB8dL0JpjtBgDgxopl8VpIDx-ZWCEkRw2n9yjKYQXOzhO7AwVQ9PYoOlvRhA9qVJUq6E06sEt9wF5P8_knXIWpqVQJKWGAwyEhSCNxePJaxnNPD3VCKgkkIB61hrLNNQjFt8NZHptJUSFkf8lWVRxsMAZV2O1__MyiB7OphI9Uep5u7UyhCof8a5MyQmn6DHOwfG-ZJ-UoWRl4zjwZH")',
                                                    }}
                                                ></div>
                                                <div>
                                                    <h5 className='font-bold text-white'>
                                                        Art Gallery Opening
                                                    </h5>
                                                    <p className='text-xs text-gray-400'>
                                                        Sun, Oct 25 • 6:00 PM
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='rounded-xl bg-[#2a3749] p-4 flex gap-4 items-center border border-white/5 opacity-50'>
                                                <div
                                                    className='h-14 w-14 rounded-lg bg-cover bg-center shrink-0'
                                                    style={{
                                                        backgroundImage:
                                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAJYqk56p7tYD-A4ervLhi2l3i6EUXOWWw6BJWxGflYkw20so-EFuRIYIcsT3hVmClxbLmJCG-RVDF-SeSFVhJLPmhXmkvSZRVAJMHw_70KoStf4Y9YBkPjloB-jlCPwplXws1_-dTck22o-Jb6jX-jXChZXr3ZJ50eWn9leVnfo8jfDUF8tWr07aSR7z5W-34zvKGeTXk9GtaE_IBEMl9Tg-XfjvAFRLgg_lz0KjnafDaouxJ0YbQmXuSMfStLAiGRcZcZcfEj6d0u")',
                                                    }}
                                                ></div>
                                                <div>
                                                    <h5 className='font-bold text-white'>
                                                        Potluck Dinner
                                                    </h5>
                                                    <p className='text-xs text-gray-400'>
                                                        Next Friday • 7:00 PM
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='px-8 pb-8 pt-4 bg-brand-darker flex justify-between text-gray-500'>
                                            <span className='material-symbols-outlined text-primary'>
                                                home
                                            </span>
                                            <span className='material-symbols-outlined'>
                                                search
                                            </span>
                                            <span className='material-symbols-outlined'>
                                                add_circle
                                            </span>
                                            <span className='material-symbols-outlined'>
                                                chat
                                            </span>
                                            <span className='material-symbols-outlined'>
                                                person
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className='py-24 bg-brand-darker/50' id='features'>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-16 md:text-center max-w-3xl mx-auto'>
                        <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                            Core Features
                        </h2>
                        <p className='mt-4 text-lg text-gray-400'>
                            Modular tools designed for modern socializing.
                            Everything you need to manage your social calendar
                            without the clutter.
                        </p>
                    </div>
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        <div className='group relative overflow-hidden rounded-2xl border border-white/5 bg-brand-dark p-8 hover:border-primary/50 transition-colors duration-300'>
                            <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
                                <span className='material-symbols-outlined text-2xl'>
                                    mail
                                </span>
                            </div>
                            <h3 className='mb-3 text-xl font-bold text-white'>
                                Smart Invites
                            </h3>
                            <p className='text-gray-400 leading-relaxed'>
                                Send elegant invitations via text or email
                                seamlessly. No account required for guests to
                                view details.
                            </p>
                        </div>
                        <div className='group relative overflow-hidden rounded-2xl border border-white/5 bg-brand-dark p-8 hover:border-primary/50 transition-colors duration-300'>
                            <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
                                <span className='material-symbols-outlined text-2xl'>
                                    photo_library
                                </span>
                            </div>
                            <h3 className='mb-3 text-xl font-bold text-white'>
                                Shared Gallery
                            </h3>
                            <p className='text-gray-400 leading-relaxed'>
                                Everyone uploads to one shared high-res album.
                                Relive the night from every angle instantly.
                            </p>
                        </div>
                        <div className='group relative overflow-hidden rounded-2xl border border-white/5 bg-brand-dark p-8 hover:border-primary/50 transition-colors duration-300'>
                            <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
                                <span className='material-symbols-outlined text-2xl'>
                                    chat_bubble
                                </span>
                            </div>
                            <h3 className='mb-3 text-xl font-bold text-white'>
                                Live Chat
                            </h3>
                            <p className='text-gray-400 leading-relaxed'>
                                Coordinate details instantly with guests in a
                                dedicated, distraction-free group chat.
                            </p>
                        </div>
                        <div className='group relative overflow-hidden rounded-2xl border border-white/5 bg-brand-dark p-8 hover:border-primary/50 transition-colors duration-300'>
                            <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
                                <span className='material-symbols-outlined text-2xl'>
                                    checklist
                                </span>
                            </div>
                            <h3 className='mb-3 text-xl font-bold text-white'>
                                RSVP Tracking
                            </h3>
                            <p className='text-gray-400 leading-relaxed'>
                                Real-time guest list management. Know exactly
                                who is coming and who needs a nudge.
                            </p>
                        </div>
                        <div className='group relative overflow-hidden rounded-2xl border border-white/5 bg-brand-dark p-8 hover:border-primary/50 transition-colors duration-300'>
                            <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
                                <span className='material-symbols-outlined text-2xl'>
                                    map
                                </span>
                            </div>
                            <h3 className='mb-3 text-xl font-bold text-white'>
                                Location Services
                            </h3>
                            <p className='text-gray-400 leading-relaxed'>
                                Integrated maps for directions and location
                                sharing to ensure no one gets lost.
                            </p>
                        </div>
                        <div className='group relative overflow-hidden rounded-2xl border border-white/5 bg-brand-dark p-8 hover:border-primary/50 transition-colors duration-300'>
                            <div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
                                <span className='material-symbols-outlined text-2xl'>
                                    qr_code_scanner
                                </span>
                            </div>
                            <h3 className='mb-3 text-xl font-bold text-white'>
                                Easy Check-in
                            </h3>
                            <p className='text-gray-400 leading-relaxed'>
                                Use QR codes for large events to manage entry
                                smoothly and securely.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className='py-24 relative overflow-hidden' id='reviews'>
                <div className='absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none'></div>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-col md:flex-row justify-between items-end mb-12 gap-6'>
                        <div className='max-w-xl'>
                            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                                What people are saying
                            </h2>
                            <p className='mt-4 text-lg text-gray-400'>
                                Join thousands of hosts who have upgraded their
                                event planning experience.
                            </p>
                        </div>
                        <div className='flex gap-2'>
                            <button className='h-10 w-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-800 transition-colors text-white'>
                                <span className='material-symbols-outlined'>
                                    arrow_back
                                </span>
                            </button>
                            <button className='h-10 w-10 rounded-full bg-primary flex items-center justify-center hover:bg-orange-600 transition-colors text-white'>
                                <span className='material-symbols-outlined'>
                                    arrow_forward
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className='flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x'>
                        <div className='min-w-[300px] md:min-w-[380px] snap-center bg-[#2a3749] rounded-2xl p-8 flex flex-col justify-between h-auto border border-white/5'>
                            <div>
                                <div className='flex gap-1 text-primary mb-4'>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                </div>
                                <p className='text-lg text-gray-200 font-medium mb-6'>
                                    &quot;Funkshan made my birthday planning
                                    effortless. The RSVP tracking alone saved me
                                    hours of spreadsheets.&quot;
                                </p>
                            </div>
                            <div className='flex items-center gap-4'>
                                <div
                                    className='h-12 w-12 rounded-full bg-cover bg-center'
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuANXbHPRMHy05ogDq5sdZdKPVTME82Q0D4A3QWrdNh2taI4CD9-1vbUq9UMkPbWHWr9x5Ypu28CrF3HDe-qGO53VWnW19ddVtv3oPpk3IK-QCM_FJGAgNVA7HDf-59KR4VAgNTlRHmV6EgKLo_lcah0nf6Gcmco-eMn1jnyM-6aqn7JD_F7vyeTEhWyJAdUEm9Npzq7DHH113JXZaSUdr0JXCEUH5fvqqAWIhW3mZsZkrA3ArpMQFNuX66XU0aI7SrJfWZTk8vDoAax")',
                                    }}
                                ></div>
                                <div>
                                    <div className='text-white font-bold'>
                                        Sarah Jenkins
                                    </div>
                                    <div className='text-sm text-primary'>
                                        Birthday Host
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='min-w-[300px] md:min-w-[380px] snap-center bg-[#2a3749] rounded-2xl p-8 flex flex-col justify-between h-auto border border-white/5'>
                            <div>
                                <div className='flex gap-1 text-primary mb-4'>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                </div>
                                <p className='text-lg text-gray-200 font-medium mb-6'>
                                    &quot;The shared gallery feature is a game
                                    changer for weddings. We got so many candid
                                    photos we would have missed otherwise.&quot;
                                </p>
                            </div>
                            <div className='flex items-center gap-4'>
                                <div
                                    className='h-12 w-12 rounded-full bg-cover bg-center'
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCKBjQNG2QZJw9THwPyI10ZU2MBiUJmxSOvYmXmzA6u9JKPvhDOntwkuuXVNBQXIR2k0SKiJofsFEdpmG-9eHNHOg4640FJGy8ZB_VjJgv1U1urjmaebGW8l2YuQUncZssjeyB0U0MIdwCievnElttLc_VflA9exKPoLIoYgEHbGAfuQKY1l2FsUU9_C0j5x-8PjNF-PKWWqeV0o0gGpke17-S3kLdolzywh4an2-lOGaYDK3mMeJ4xboV1sRo7MS2A7Rpx1FXsG2nP")',
                                    }}
                                ></div>
                                <div>
                                    <div className='text-white font-bold'>
                                        Mark Davidson
                                    </div>
                                    <div className='text-sm text-primary'>
                                        Groom
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='min-w-[300px] md:min-w-[380px] snap-center bg-[#2a3749] rounded-2xl p-8 flex flex-col justify-between h-auto border border-white/5'>
                            <div>
                                <div className='flex gap-1 text-primary mb-4'>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                </div>
                                <p className='text-lg text-gray-200 font-medium mb-6'>
                                    &quot;Finally an app that organizes my
                                    social life without the clutter. It&apos;s
                                    clean, fast, and does exactly what it
                                    promises.&quot;
                                </p>
                            </div>
                            <div className='flex items-center gap-4'>
                                <div
                                    className='h-12 w-12 rounded-full bg-cover bg-center'
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAA9SFOMNh9ci_zEyNSzKNPwfKuv_qUQGsBUFEMOoib_c5miAF5nzxlgrp2oGwQFoGJJWDtlEFr_Kld72_QGQjxOqwwIQmTBQxiPq1s8bYUHernyTSMm20Y5ahB_11M_2mNs_4qevL62JN9jGMN6NCWW550BPDClbiKLy9G7jPK_7QsfsFrPBy95BzH0VZAX0jQXuJVtgMBToybpshltT2KRof3I3f_JOv-4utJ5YfE0NpGz_PVRHAXr5UXVRfZnWjii9QpkDaS6V5d")',
                                    }}
                                ></div>
                                <div>
                                    <div className='text-white font-bold'>
                                        Emily Rivers
                                    </div>
                                    <div className='text-sm text-primary'>
                                        Party Enthusiast
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='min-w-[300px] md:min-w-[380px] snap-center bg-[#2a3749] rounded-2xl p-8 flex flex-col justify-between h-auto border border-white/5'>
                            <div>
                                <div className='flex gap-1 text-primary mb-4'>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star
                                    </span>
                                    <span className='material-symbols-outlined text-sm'>
                                        star_half
                                    </span>
                                </div>
                                <p className='text-lg text-gray-200 font-medium mb-6'>
                                    &quot;Used it for a corporate retreat. The
                                    map integration and schedule updates were
                                    incredibly useful for the team.&quot;
                                </p>
                            </div>
                            <div className='flex items-center gap-4'>
                                <div
                                    className='h-12 w-12 rounded-full bg-cover bg-center'
                                    style={{
                                        backgroundImage:
                                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDXPRVDehzbdBusPDsw7_X6pU0MextKf2DuMt53VS6QYzbTjjfbiix5P-1Mfph1-BoZPZL0ZR4jHxwX8A-_3dg6XBxa4iq06ZJg0fxSjV-iwolJCxiFuPV741FcXA6cjLww4gU5V_B3w1NXxG2CRdy5q7AoVxD1CkUvicmSgII_VtYdlcRzpZTaZWouMPpbGfn7hiUsAntakHEgACsBeJrGKnG6RMrhovYcYEIKG9ulz6cX1cxFL2zeHU91BoMfGV0x8Z7AH6EEONRH")',
                                    }}
                                ></div>
                                <div>
                                    <div className='text-white font-bold'>
                                        James Turner
                                    </div>
                                    <div className='text-sm text-primary'>
                                        Team Lead
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-24 bg-primary relative overflow-hidden'>
                <div className='absolute inset-0 bg-brand-dark opacity-10 pattern-dots'></div>
                <div className='mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center'>
                    <h2 className='text-4xl font-black tracking-tight text-white sm:text-5xl mb-6'>
                        Ready to upgrade your social life?
                    </h2>
                    <p className='mx-auto max-w-2xl text-lg leading-8 text-white/90 mb-10'>
                        Join the thousands of hosts and guests who are making
                        memories, not just events. Download Funkshan today.
                    </p>
                    <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                        <button className='flex items-center justify-center gap-3 bg-brand-darker text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-dark transition-all transform hover:-translate-y-1 shadow-xl border border-white/10 w-full sm:w-auto'>
                            <img
                                alt='Apple'
                                className='h-6 w-6 invert'
                                src='https://lh3.googleusercontent.com/aida-public/AB6AXuBApg6J-KVowQmzPWa5SKJvpexOkfJOcr8_1YG1FjsEgqfFXpIu0BHqLj50vzJd2Mkbd9dwT6kckgE9i1XbWe-B3Nz3cWlE54Tw22cekUOS_bmE97F8F0pjYT9rgt2EFBh5Pm4fh35-TaB8MXQkWy31rZbpc05r8hm3LVTOcdILCCVb36asXf63GKyi-n04RcFFml7b6mWtJnt7tfZXXuJNzlud24rYDBU70CjSvqKRbIULj2kZm20LoNKbYZDV9a03EDZcO-9CLOD-'
                            />
                            <span>App Store</span>
                        </button>
                        <button className='flex items-center justify-center gap-3 bg-white text-brand-dark px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-xl w-full sm:w-auto'>
                            <img
                                alt='Android'
                                className='h-6 w-6'
                                src='https://lh3.googleusercontent.com/aida-public/AB6AXuDsDvOqPvUqWRKDEQQKF_XCUeMa4HTt1ifjKCCf9e-q-znWCwhwnFGaW98yYALoYuxqflyk_eOreyJFeBUbIiMq-QxY0xlQ-8o8UD4t_xHDkLut--2MmlMLzuxoJcLQLkhtv0UJaMTdK271-1G_N75ydz9J0Gc1rqhLaCn8FhD1EIGm6YDq7IbDk9RnuK6i0ImTL4s7WUok0S_ZOg4PvJWTQj2J1bJeFiRrlCaoZoR3YylzlqC-5XC5hCgbLXDEv9yiBrXMHiRbk51n'
                            />
                            <span>Google Play</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className='bg-brand-darker border-t border-white/5 pt-16 pb-12'>
                <div className='mx-auto max-w-7xl px-6 lg:px-8'>
                    <div className='xl:grid xl:grid-cols-3 xl:gap-16'>
                        <div className='space-y-8'>
                            <div className='flex items-center gap-2'>
                                <div className='flex  items-center justify-center'>
                                    <img
                                        src='/funkshan_logo_white.svg'
                                        alt='Funkshan Logo'
                                        className='w-40'
                                    />
                                </div>
                            </div>
                            <p className='text-sm leading-6 text-gray-400 max-w-xs'>
                                &quot;Invite, Socialize, Memorialize.&quot;
                                <br />
                                The future of event planning is here, designed
                                for modern connections.
                            </p>
                            <div className='flex space-x-6'>
                                <a
                                    className='text-gray-400 hover:text-primary transition-colors'
                                    href='#'
                                >
                                    <span className='sr-only'>Twitter</span>
                                    <svg
                                        className='h-6 w-6'
                                        fill='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84'></path>
                                    </svg>
                                </a>
                                <a
                                    className='text-gray-400 hover:text-primary transition-colors'
                                    href='#'
                                >
                                    <span className='sr-only'>Instagram</span>
                                    <svg
                                        className='h-6 w-6'
                                        fill='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            clipRule='evenodd'
                                            d='M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 014.168 4.15c.636-.247 1.363-.416 2.427-.465C7.673 3.634 8.02 3.634 10.33 3.634c2.31 0 2.657 0 3.682.046 1.025.047 1.636.208 2.102.389.605.234 1.037.521 1.488.972.45.45.738.883.972 1.488.181.466.342 1.077.389 2.102.047 1.025.047 1.372.047 3.682s0 2.657-.047 3.682c-.047 1.025-.208 1.636-.389 2.102-.234.605-.521 1.037-.972 1.488-.45.45-.883.738-1.488.972-.466.181-1.077.342-2.102.389-1.025.047-1.372.047-3.682.047-.96 0-1.93-.004-2.883-.012l.003-.038zm9.062-8.314a3.15 3.15 0 11-6.3 0 3.15 3.15 0 016.3 0zM16.92 7.08a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z'
                                            fillRule='evenodd'
                                        ></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className='mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0'>
                            <div className='md:grid md:grid-cols-2 md:gap-8'>
                                <div>
                                    <h3 className='text-sm font-semibold leading-6 text-white'>
                                        Product
                                    </h3>
                                    <ul className='mt-6 space-y-4' role='list'>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Features
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Integrations
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Pricing
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Download
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className='mt-10 md:mt-0'>
                                    <h3 className='text-sm font-semibold leading-6 text-white'>
                                        Company
                                    </h3>
                                    <ul className='mt-6 space-y-4' role='list'>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                About Us
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Careers
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Blog
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Press
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className='md:grid md:grid-cols-2 md:gap-8'>
                                <div>
                                    <h3 className='text-sm font-semibold leading-6 text-white'>
                                        Support
                                    </h3>
                                    <ul className='mt-6 space-y-4' role='list'>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Help Center
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Safety
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Contact
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className='mt-10 md:mt-0'>
                                    <h3 className='text-sm font-semibold leading-6 text-white'>
                                        Legal
                                    </h3>
                                    <ul className='mt-6 space-y-4' role='list'>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Privacy Policy
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className='text-sm leading-6 text-gray-400 hover:text-primary transition-colors'
                                                href='#'
                                            >
                                                Terms of Service
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mt-16 border-t border-white/5 pt-8 sm:mt-20 lg:mt-24'>
                        <p className='text-xs leading-5 text-gray-500'>
                            © 2025-2026 Funkshan Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
