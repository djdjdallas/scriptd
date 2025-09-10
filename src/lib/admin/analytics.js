// Analytics utility functions for calculating metrics and processing data

export class AnalyticsCalculator {
  // Calculate percentage change between two values
  static calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Calculate growth rate over a period
  static calculateGrowthRate(data, dateField = 'date', valueField = 'value') {
    if (!data || data.length < 2) return 0;
    
    const sortedData = [...data].sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));
    const first = sortedData[0][valueField];
    const last = sortedData[sortedData.length - 1][valueField];
    
    return this.calculatePercentageChange(last, first);
  }

  // Calculate moving average
  static calculateMovingAverage(data, window = 7, valueField = 'value') {
    if (!data || data.length < window) return data;
    
    return data.map((item, index) => {
      if (index < window - 1) return { ...item, movingAverage: item[valueField] };
      
      const slice = data.slice(index - window + 1, index + 1);
      const average = slice.reduce((sum, item) => sum + item[valueField], 0) / window;
      
      return { ...item, movingAverage: Math.round(average * 100) / 100 };
    });
  }

  // Fill missing dates in time series data
  static fillMissingDates(data, startDate, endDate, dateField = 'date', valueField = 'value', fillValue = 0) {
    const result = [];
    const dataMap = new Map();
    
    // Create map of existing data
    data.forEach(item => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      dataMap.set(date, item[valueField]);
    });
    
    // Fill in missing dates
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const value = dataMap.get(dateStr) || fillValue;
      
      result.push({
        [dateField]: dateStr,
        [valueField]: value
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return result;
  }

  // Calculate cumulative data
  static calculateCumulative(data, valueField = 'value') {
    let cumulative = 0;
    return data.map(item => {
      cumulative += item[valueField];
      return { ...item, cumulative };
    });
  }

  // Calculate retention rate
  static calculateRetentionRate(cohortData) {
    if (!cohortData || cohortData.length === 0) return [];
    
    return cohortData.map(cohort => {
      const { cohortSize, returningUsers } = cohort;
      const retentionRate = cohortSize > 0 ? (returningUsers / cohortSize) * 100 : 0;
      return { ...cohort, retentionRate: Math.round(retentionRate * 100) / 100 };
    });
  }

  // Calculate churn rate
  static calculateChurnRate(totalUsers, churnedUsers) {
    if (totalUsers === 0) return 0;
    return (churnedUsers / totalUsers) * 100;
  }

  // Calculate Customer Lifetime Value (CLV)
  static calculateCLV(averageRevenue, churnRate) {
    if (churnRate === 0) return Infinity;
    return averageRevenue / (churnRate / 100);
  }

  // Aggregate data by time period
  static aggregateByTimePeriod(data, period = 'day', dateField = 'created_at', valueField = 'value') {
    const aggregated = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      let key;
      
      switch (period) {
        case 'hour':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!aggregated[key]) {
        aggregated[key] = { date: key, count: 0, total: 0 };
      }
      
      aggregated[key].count += 1;
      if (item[valueField] !== undefined) {
        aggregated[key].total += item[valueField];
      }
    });
    
    return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Calculate funnel conversion rates
  static calculateFunnelConversions(steps) {
    return steps.map((step, index) => {
      if (index === 0) {
        return { ...step, conversionRate: 100, dropoffRate: 0 };
      }
      
      const previousStep = steps[index - 1];
      const conversionRate = previousStep.count > 0 ? (step.count / previousStep.count) * 100 : 0;
      const dropoffRate = 100 - conversionRate;
      
      return {
        ...step,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropoffRate: Math.round(dropoffRate * 100) / 100
      };
    });
  }

  // Calculate feature adoption rates
  static calculateFeatureAdoption(totalUsers, featureUsers) {
    if (totalUsers === 0) return 0;
    return (featureUsers / totalUsers) * 100;
  }

  // Calculate engagement score
  static calculateEngagementScore(metrics) {
    const {
      dailyActiveUsers = 0,
      monthlyActiveUsers = 0,
      averageSessionDuration = 0,
      pagesPerSession = 0,
      bounceRate = 0
    } = metrics;
    
    // Normalize metrics (0-100 scale)
    const dauMauRatio = monthlyActiveUsers > 0 ? (dailyActiveUsers / monthlyActiveUsers) * 100 : 0;
    const sessionScore = Math.min((averageSessionDuration / 300) * 100, 100); // 5 minutes = 100%
    const pageScore = Math.min((pagesPerSession / 5) * 100, 100); // 5 pages = 100%
    const bounceScore = 100 - bounceRate;
    
    // Weight the scores
    const engagementScore = (
      dauMauRatio * 0.3 +
      sessionScore * 0.25 +
      pageScore * 0.25 +
      bounceScore * 0.2
    );
    
    return Math.round(engagementScore * 100) / 100;
  }

  // Format numbers for display
  static formatNumber(num, options = {}) {
    const {
      notation = 'standard',
      maximumFractionDigits = 2,
      currency = 'USD'
    } = options;
    
    if (typeof num !== 'number' || isNaN(num)) return '0';
    
    if (options.currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits
      }).format(num);
    }
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    
    return new Intl.NumberFormat('en-US', {
      notation,
      maximumFractionDigits
    }).format(num);
  }

  // Format percentage
  static formatPercentage(num, decimals = 1) {
    if (typeof num !== 'number' || isNaN(num)) return '0%';
    return `${num.toFixed(decimals)}%`;
  }

  // Calculate time-based cohorts
  static calculateCohorts(userData, cohortPeriod = 'month') {
    const cohorts = {};
    
    userData.forEach(user => {
      const signupDate = new Date(user.created_at);
      let cohortKey;
      
      switch (cohortPeriod) {
        case 'week':
          const weekStart = new Date(signupDate);
          weekStart.setDate(signupDate.getDate() - signupDate.getDay());
          cohortKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          cohortKey = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(signupDate.getMonth() / 3) + 1;
          cohortKey = `${signupDate.getFullYear()}-Q${quarter}`;
          break;
        default:
          cohortKey = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = [];
      }
      
      cohorts[cohortKey].push(user);
    });
    
    return cohorts;
  }

  // Calculate seasonal trends
  static calculateSeasonalTrends(data, dateField = 'date', valueField = 'value') {
    const seasonal = {
      months: {},
      daysOfWeek: {},
      hours: {}
    };
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      const month = date.getMonth();
      const dayOfWeek = date.getDay();
      const hour = date.getHours();
      
      // Monthly trends
      if (!seasonal.months[month]) {
        seasonal.months[month] = { count: 0, total: 0 };
      }
      seasonal.months[month].count += 1;
      seasonal.months[month].total += item[valueField] || 1;
      
      // Day of week trends
      if (!seasonal.daysOfWeek[dayOfWeek]) {
        seasonal.daysOfWeek[dayOfWeek] = { count: 0, total: 0 };
      }
      seasonal.daysOfWeek[dayOfWeek].count += 1;
      seasonal.daysOfWeek[dayOfWeek].total += item[valueField] || 1;
      
      // Hourly trends
      if (!seasonal.hours[hour]) {
        seasonal.hours[hour] = { count: 0, total: 0 };
      }
      seasonal.hours[hour].count += 1;
      seasonal.hours[hour].total += item[valueField] || 1;
    });
    
    return seasonal;
  }

  // Calculate statistical measures
  static calculateStatistics(values) {
    if (!values || values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    
    // Median
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    // Standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Quartiles
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    
    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      mode: this.calculateMode(values),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      q1: Math.round(q1 * 100) / 100,
      q3: Math.round(q3 * 100) / 100,
      iqr: Math.round((q3 - q1) * 100) / 100
    };
  }

  static calculateMode(values) {
    const frequency = {};
    let maxFreq = 0;
    let mode = null;
    
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    });
    
    return mode;
  }
}

// Predefined metric calculators
export const MetricCalculators = {
  // User metrics
  userGrowth: (current, previous) => AnalyticsCalculator.calculatePercentageChange(current, previous),
  userRetention: (returning, total) => total > 0 ? (returning / total) * 100 : 0,
  userChurn: (churned, total) => AnalyticsCalculator.calculateChurnRate(total, churned),
  
  // Content metrics
  scriptGeneration: (scripts, users) => users > 0 ? scripts / users : 0,
  scriptEngagement: (views, scripts) => scripts > 0 ? views / scripts : 0,
  
  // Team metrics
  teamCollaboration: (activeTeams, totalTeams) => totalTeams > 0 ? (activeTeams / totalTeams) * 100 : 0,
  
  // Revenue metrics
  mrr: (subscriptions) => subscriptions.reduce((sum, sub) => sum + sub.monthlyValue, 0),
  arr: (mrr) => mrr * 12,
  ltv: (averageRevenue, churnRate) => AnalyticsCalculator.calculateCLV(averageRevenue, churnRate)
};

// Chart data processors
export const ChartDataProcessors = {
  // Process time series data for line charts
  processTimeSeriesData: (data, dateField = 'date', valueField = 'value') => {
    return data.map(item => ({
      date: new Date(item[dateField]).toLocaleDateString(),
      value: item[valueField] || 0,
      ...item
    }));
  },
  
  // Process data for bar charts
  processBarChartData: (data, labelField = 'label', valueField = 'value') => {
    return data.map(item => ({
      label: item[labelField],
      value: item[valueField] || 0,
      ...item
    }));
  },
  
  // Process data for pie charts
  processPieChartData: (data, labelField = 'label', valueField = 'value') => {
    const total = data.reduce((sum, item) => sum + (item[valueField] || 0), 0);
    return data.map(item => ({
      name: item[labelField],
      value: item[valueField] || 0,
      percentage: total > 0 ? ((item[valueField] || 0) / total) * 100 : 0,
      ...item
    }));
  },
  
  // Process funnel data
  processFunnelData: (data) => {
    return AnalyticsCalculator.calculateFunnelConversions(data);
  }
};

export default AnalyticsCalculator;