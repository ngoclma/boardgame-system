// src/utils/formatters.ts

// Format date from ISO string to readable format
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Format time (e.g., "2h 15m")
  export const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };
  
  // Format percentage with 1 decimal place
  export const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Format victory points
  export const formatVictoryPoints = (points: number): string => {
    return points.toFixed(2);
  };
  
  // Format ordinal numbers (1st, 2nd, 3rd, etc.)
  export const formatOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  // Format player rank with color coding
  export const formatRankWithColor = (rank: number): { text: string; color: string } => {
    let color = '';
    
    if (rank === 1) {
      color = 'text-yellow-500'; // Gold
    } else if (rank === 2) {
      color = 'text-gray-400'; // Silver
    } else if (rank === 3) {
      color = 'text-amber-700'; // Bronze
    }
    
    return {
      text: formatOrdinal(rank),
      color,
    };
  };
  
  // Format game duration from start and end time
  export const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / 60000); // Convert to minutes
  };