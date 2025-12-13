export const Pricing = () => {
  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      period: '/mo',
      description: 'Perfect for testing the waters',
      features: [
        '2 minutes of video per month',
        '720p Export',
        'Watermark on exports',
        'Basic subtitle styles',
        'Email support',
      ],
      cta: 'Start Free',
      highlight: false,
    },
    {
      name: 'Creator Plan',
      price: '$15',
      period: '/mo',
      description: 'For serious content creators',
      features: [
        '60 minutes of video',
        '1080p Export',
        'No Watermark',
        'Premium subtitle styles',
        'Custom fonts & colors',
        'Priority support',
      ],
      cta: 'Start Creating',
      highlight: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-6 relative bg-gradient-to-b from-[#0F0F12] to-[#0A0A0C]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white mb-4">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-xl text-[#B4B4C8]">
            Start free. Upgrade when you're ready to go viral.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/[0.02] border-2 rounded-3xl p-10 flex flex-col gap-8 transition-all duration-300
                hover:-translate-y-2 
                ${plan.highlight 
                  ? 'bg-gradient-to-br from-[#FF5E00]/5 to-[#FF3C78]/5 border-[#FF5E00] shadow-[0_20px_60px_rgba(255,94,0,0.2)] hover:shadow-[0_24px_80px_rgba(255,94,0,0.3)]' 
                  : 'border-white/[0.08] hover:border-white/20'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] text-white text-xs font-extrabold px-6 py-2 rounded-full tracking-wider shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="flex flex-col gap-2">
                <h3 className="text-3xl font-extrabold text-white">
                  {plan.name}
                </h3>
                <p className="text-base text-[#B4B4C8]">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-6xl font-black leading-none
                  ${plan.highlight ? 'gradient-text' : 'text-white'}`}>
                  {plan.price}
                </span>
                <span className="text-xl text-[#6E6E8C] font-semibold">
                  {plan.period}
                </span>
              </div>

              <ul className="list-none p-0 m-0 flex flex-col gap-4 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-[#B4B4C8] leading-relaxed">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-black flex-shrink-0
                      ${plan.highlight 
                        ? 'bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] text-white' 
                        : 'bg-white/[0.08] text-[#00E676]'}`}>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full px-8 py-4 text-lg font-bold rounded-xl cursor-pointer transition-all duration-300
                ${plan.highlight
                  ? 'bg-gradient-to-br from-[#FF5E00] to-[#FF3C78] text-white shadow-[0_8px_24px_rgba(255,94,0,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(255,94,0,0.5)]'
                  : 'bg-transparent border-2 border-white/20 text-white hover:bg-white/5 hover:border-white/30'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-[#B4B4C8] px-8 py-6 bg-[#FF5E00]/10 border border-[#FF5E00]/20 rounded-2xl inline-block">
            🔥 First 3 videos are <strong className="text-[#FF5E00] font-extrabold">watermark-free</strong> on the Free Plan
          </p>
        </div>
      </div>
    </section>
  );
};
