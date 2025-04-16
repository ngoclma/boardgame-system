// src/utils/constants.ts

// Period options for ranking filters
export const RANKING_PERIODS = [
    { value: 'all-time', label: 'All Time' },
    { value: 'yearly', label: 'This Year' },
    { value: 'monthly', label: 'This Month' },
  ];
  
  // Years for year selection (dynamic generation)
  export const YEARS_OPTIONS = (): { value: number; label: string }[] => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020; // Adjust based on your data
    const years = [];
    
    for (let year = currentYear; year >= startYear; year--) {
      years.push({ value: year, label: year.toString() });
    }
    
    return years;
  };
  
  // Default pagination options
  export const PAGINATION_OPTIONS = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  };
  
  // Color scheme for charts
  export const CHART_COLORS = [
    '#4C51BF', // Indigo
    '#38B2AC', // Teal
    '#ED8936', // Orange
    '#9F7AEA', // Purple
    '#F56565', // Red
    '#48BB78', // Green
    '#ECC94B', // Yellow
    '#667EEA', // Indigo
    '#0D9488', // Teal
    '#F43F5E', // Pink
  ];