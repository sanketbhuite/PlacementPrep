// Loads public JSON seeds ONCE into localStorage
export async function ensureSeedsLoaded() {
  if (!localStorage.getItem('users')) {
    try {
      const res = await fetch('/data/users.json');
      const users = await res.json();
      localStorage.setItem('users', JSON.stringify(users));
    } catch {
      localStorage.setItem('users', JSON.stringify([]));
    }
  }
  if (!localStorage.getItem('mcq')) {
    try {
      const res = await fetch('/data/mcq.json');
      const mcq = await res.json();
      localStorage.setItem('mcq', JSON.stringify(mcq));
    } catch {
      localStorage.setItem('mcq', JSON.stringify([]));
    }
  }
  if (!localStorage.getItem('mocktests')) {
    try {
      const res = await fetch('/data/mocktests.json');
      const tests = await res.json();
      localStorage.setItem('mocktests', JSON.stringify(tests));
    } catch {
      localStorage.setItem('mocktests', JSON.stringify([]));
    }
  }
}
