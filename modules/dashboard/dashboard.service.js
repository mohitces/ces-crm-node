const Blog = require('../blogs/blog.model');
const CaseStudy = require('../case-studies/case-study.model');
const ClientQuery = require('../queries/query.model');
const Testimonial = require('../feedback/feedback.model');
const Partner = require('../partners/partner.model');

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const getStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const buildLastDays = (days = 7) => {
  const today = getStartOfDay(new Date());
  return Array.from({ length: days }, (_, idx) => {
    const date = new Date(today.getTime() - (days - 1 - idx) * MS_IN_DAY);
    return date;
  });
};

const formatDayLabel = (date) => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
};

const formatCount = (value) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return `${value}`;
};

const countByDay = (items, days) => {
  const counts = new Array(days.length).fill(0);
  items.forEach((item) => {
    const created = getStartOfDay(new Date(item));
    const index = days.findIndex((d) => d.getTime() === created.getTime());
    if (index >= 0) counts[index] += 1;
  });
  return counts;
};

const sum = (arr) => arr.reduce((acc, value) => acc + value, 0);

const buildTrend = (current, previous) => {
  if (!previous) return { value: 100, direction: current ? 'up' : 'down' };
  const diff = current - previous;
  const percent = Math.round((Math.abs(diff) / previous) * 100);
  return { value: percent, direction: diff >= 0 ? 'up' : 'down' };
};

const getDashboardData = async () => {
  const days = buildLastDays(7);
  const dayLabels = days.map((date) => formatDayLabel(date));
  const startDate = days[0];

  const [
    blogs,
    caseStudies,
    queries,
    feedback,
    partners,
    totalBlogCount,
    totalCaseCount,
  ] = await Promise.all([
    Blog.find({ status: 'published', publishedAt: { $gte: startDate } }, 'publishedAt createdAt').lean(),
    CaseStudy.find({ status: 'published', createdAt: { $gte: startDate } }, 'createdAt').lean(),
    ClientQuery.find({ createdAt: { $gte: startDate } }, 'createdAt').lean(),
    Testimonial.find({}, 'isActive').lean(),
    Partner.find({}, 'status type').lean(),
    Blog.countDocuments(),
    CaseStudy.countDocuments(),
  ]);

  const blogDates = blogs.map((item) => item.publishedAt || item.createdAt);
  const caseDates = caseStudies.map((item) => item.createdAt);
  const queryDates = queries.map((item) => item.createdAt);

  const blogSeries = countByDay(blogDates, days);
  const caseSeries = countByDay(caseDates, days);
  const querySeries = countByDay(queryDates, days);

  const queryNewCount = queries.length;
  const queryOlderCount = await ClientQuery.countDocuments({ createdAt: { $lt: startDate } });

  const feedbackActive = feedback.filter((item) => item.isActive).length;
  const feedbackTotal = feedback.length;
  const partnersActive = partners.filter((item) => item.status === 'active').length;
  const partnersTotal = partners.length;
  const partnerByType = partners.reduce(
    (acc, partner) => {
      const key = partner.type || 'client';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { client: 0, enterprise: 0, startup: 0, technology: 0 },
  );

  const postBars = blogSeries.map((value, idx) => value + caseSeries[idx]);
  const trendA = postBars.map((value, idx) => Math.round(value * 0.6 + (idx % 2 ? 2 : 1)));
  const trendB = postBars.map((value, idx) => Math.round(value * 0.4 + (idx % 3 ? 1 : 2)));

  const last30Start = new Date(getStartOfDay(new Date()).getTime() - 29 * MS_IN_DAY);
  const last7Start = new Date(getStartOfDay(new Date()).getTime() - 6 * MS_IN_DAY);
  const prev7Start = new Date(getStartOfDay(new Date()).getTime() - 13 * MS_IN_DAY);

  const [blogLast30, caseLast30, queryLast30] = await Promise.all([
    Blog.countDocuments({ createdAt: { $gte: last30Start } }),
    CaseStudy.countDocuments({ createdAt: { $gte: last30Start } }),
    ClientQuery.countDocuments({ createdAt: { $gte: last30Start } }),
  ]);

  const [blogLast7, caseLast7, queryLast7] = await Promise.all([
    Blog.countDocuments({ createdAt: { $gte: last7Start } }),
    CaseStudy.countDocuments({ createdAt: { $gte: last7Start } }),
    ClientQuery.countDocuments({ createdAt: { $gte: last7Start } }),
  ]);

  const [blogPrev7, casePrev7, queryPrev7] = await Promise.all([
    Blog.countDocuments({ createdAt: { $gte: prev7Start, $lt: last7Start } }),
    CaseStudy.countDocuments({ createdAt: { $gte: prev7Start, $lt: last7Start } }),
    ClientQuery.countDocuments({ createdAt: { $gte: prev7Start, $lt: last7Start } }),
  ]);

  const activity = [
    {
      title: 'Latest Blog Posts',
      subtitle: 'Published',
      category: 'Company',
      metric: formatCount(blogLast30),
      trend: buildTrend(blogLast7, blogPrev7),
    },
    {
      title: 'Case Studies',
      subtitle: 'Highlights',
      category: 'Product',
      metric: formatCount(caseLast30),
      trend: buildTrend(caseLast7, casePrev7),
    },
    {
      title: 'Client Queries',
      subtitle: 'New Leads',
      category: 'Persona',
      metric: formatCount(queryLast30),
      trend: buildTrend(queryLast7, queryPrev7),
    },
  ];

  return {
    summary: {
      blogs: { total: totalBlogCount },
      caseStudies: { total: totalCaseCount },
      queries: { total: await ClientQuery.countDocuments() },
      feedback: { total: feedbackTotal, active: feedbackActive },
      partners: { total: partnersTotal, active: partnersActive, byType: partnerByType },
    },
    socialClicks: [
      { platform: 'LinkedIn', clicks: 0 },
      { platform: 'Instagram', clicks: 0 },
      { platform: 'Facebook', clicks: 0 },
      { platform: 'X', clicks: 0 },
      { platform: 'YouTube', clicks: 0 },
    ],
    charts: {
      totalLikes: {
        labels: dayLabels,
        series: {
          blogs: blogSeries,
          caseStudies: caseSeries,
          queries: querySeries,
        },
      },
      pendingMessages: {
        labels: ['New', 'Earlier'],
        series: [queryNewCount, queryOlderCount],
      },
      comments: {
        current: feedbackActive,
        total: feedbackTotal || 1,
      },
      linksShared: {
        current: partnersActive,
        total: partnersTotal || 1,
      },
      postStats: {
        labels: dayLabels,
        bars: postBars,
        trendA,
        trendB,
      },
    },
    activity,
  };
};

module.exports = { getDashboardData };
