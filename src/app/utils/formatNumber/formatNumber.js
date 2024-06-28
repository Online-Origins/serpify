export function formatNumber(num) {
    if (parseInt(num.toString().replace(/-/g, '')) >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }