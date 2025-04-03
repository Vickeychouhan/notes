const ADMIN_CONFIG = {
  defaultAdmin: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // In production, use a secure password
    isAdmin: true
  }
};

const adminService = {
  initializeAdmin: () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.some(user => user.isAdmin)) {
      users.push({
        ...ADMIN_CONFIG.defaultAdmin,
        id: Date.now().toString()
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  },

  isAdmin: (username) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username);
    return user?.isAdmin || false;
  },

  makeAdmin: (username) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(user => {
      if (user.username === username) {
        return { ...user, isAdmin: true };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  },

  removeAdmin: (username) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // Prevent removing the last admin
    const adminCount = users.filter(u => u.isAdmin).length;
    if (adminCount <= 1) {
      throw new Error('Cannot remove the last administrator');
    }

    const updatedUsers = users.map(user => {
      if (user.username === username) {
        return { ...user, isAdmin: false };
      }
      return user;
    });
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  },

  getAdmins: () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(user => user.isAdmin);
  }
};

export default adminService;