import React from 'react';
import { cn } from '@/lib/utils';

export function MarketingSection({ 
  children, 
  className,
  gradient = false,
  dark = false,
  ...props 
}) {
  return (
    <section 
      className={cn(
        "relative py-20 px-4",
        gradient && "bg-gradient-to-b from-gray-900 via-black to-gray-900",
        dark && "bg-black",
        !gradient && !dark && "bg-gray-950",
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}

export function MarketingHero({ 
  badge,
  title, 
  subtitle, 
  primaryCTA,
  secondaryCTA,
  metrics,
  children,
  className 
}) {
  return (
    <MarketingSection gradient className={cn("pt-24 pb-32", className)}>
      <div className="text-center space-y-6">
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
            {badge}
          </div>
        )}
        
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {primaryCTA}
          {secondaryCTA}
        </div>

        {metrics && (
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500 pt-8">
            {metrics.map((metric, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {metric.icon && <metric.icon className="w-4 h-4" />}
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </MarketingSection>
  );
}

export function MarketingCard({ 
  children, 
  className,
  hover = true,
  glow = false,
  ...props 
}) {
  return (
    <div 
      className={cn(
        "glass-card",
        hover && "transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        glow && "hover:shadow-purple-500/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FeatureGrid({ features, columns = 3 }) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4"
  };

  return (
    <div className={cn("grid gap-8", gridCols[columns])}>
      {features.map((feature, idx) => (
        <MarketingCard key={idx} hover glow>
          <div className="space-y-4">
            {feature.icon && (
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                "bg-gradient-to-r",
                feature.gradient || "from-purple-500/20 to-pink-500/20"
              )}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
            )}
            <h3 className="text-xl font-bold text-white">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
            {feature.benefit && (
              <div className="pt-2 text-sm font-medium text-purple-400">
                → {feature.benefit}
              </div>
            )}
          </div>
        </MarketingCard>
      ))}
    </div>
  );
}

export function ComparisonSection({ 
  title,
  subtitle,
  competitor,
  features,
  className 
}) {
  return (
    <MarketingSection className={className}>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
        {subtitle && <p className="text-xl text-gray-400">{subtitle}</p>}
      </div>

      <MarketingCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                <th className="text-center py-4 px-6 text-gray-400 font-medium">{competitor}</th>
                <th className="text-center py-4 px-6 text-purple-400 font-medium">GenScript</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={idx} className="border-b border-gray-800">
                  <td className="py-4 px-6 text-white font-medium">{feature.feature}</td>
                  <td className="py-4 px-6 text-center">
                    <FeatureValue value={feature.competitor} />
                  </td>
                  <td className="py-4 px-6 text-center bg-purple-500/5">
                    <FeatureValue value={feature.genscript} winner />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MarketingCard>
    </MarketingSection>
  );
}

function FeatureValue({ value, winner }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="text-green-400">✓</span>
    ) : (
      <span className="text-gray-600">✗</span>
    );
  }
  
  return (
    <span className={cn(
      winner ? "text-green-400 font-medium" : "text-gray-400"
    )}>
      {value}
    </span>
  );
}

export function TestimonialSection({ title, subtitle, testimonials }) {
  return (
    <MarketingSection>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
        {subtitle && <p className="text-xl text-gray-400">{subtitle}</p>}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, idx) => (
          <MarketingCard key={idx}>
            <div className="space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              
              <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              
              <div className="pt-4 border-t border-gray-800">
                <div className="font-medium text-white">{testimonial.name}</div>
                <div className="text-sm text-gray-400">
                  {testimonial.channel} • {testimonial.subscribers}
                </div>
                
                {testimonial.beforeAfter && (
                  <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Results:</div>
                    <div className="text-sm">
                      <span className="text-red-400">Before: {testimonial.beforeAfter.before}</span>
                      <br />
                      <span className="text-green-400">After: {testimonial.beforeAfter.after}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </MarketingCard>
        ))}
      </div>
    </MarketingSection>
  );
}

export function CTASection({ 
  title, 
  subtitle, 
  primaryButton,
  secondaryButton,
  badge,
  features 
}) {
  return (
    <MarketingSection gradient className="py-24">
      <div className="text-center max-w-4xl mx-auto">
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            {badge}
          </div>
        )}
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-xl text-gray-400 mb-8">
            {subtitle}
          </p>
        )}

        {features && (
          <div className="glass-card max-w-2xl mx-auto mb-8 p-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButton}
          {secondaryButton}
        </div>
      </div>
    </MarketingSection>
  );
}

export function FAQSection({ title, faqs }) {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <MarketingSection>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">{title}</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <MarketingCard key={idx} className="cursor-pointer" onClick={() => setOpenIndex(openIndex === idx ? null : idx)}>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-white pr-4">{faq.question}</h3>
                <span className="text-gray-400 text-2xl">
                  {openIndex === idx ? '−' : '+'}
                </span>
              </div>
              
              {openIndex === idx && (
                <p className="mt-4 text-gray-400">{faq.answer}</p>
              )}
            </MarketingCard>
          ))}
        </div>
      </div>
    </MarketingSection>
  );
}

export function StatsBar({ stats }) {
  return (
    <div className="glass-card">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, idx) => (
          <div key={idx}>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}