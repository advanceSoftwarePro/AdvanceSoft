
  export async function fetchStatistics() {
    const response = await fetch('http://localhost:3000/api/admin/statistics');
    const data = await response.json();
    return data;
  }
  