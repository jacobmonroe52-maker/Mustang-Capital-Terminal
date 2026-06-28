import { db } from './db';
import { useAuthStore } from '../store/authStore';

export async function initAuth() {
  const store = useAuthStore.getState();
  store.setLoading(true);

  const unsubscribe = db.onAuthChange((profile) => {
    store.setProfile(profile);
    store.setLoading(false);
  });

  return unsubscribe;
}
