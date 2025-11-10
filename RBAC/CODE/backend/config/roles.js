// Role -> Permissions matrix. Add or change as needed.
module.exports = {
  Admin: {
    'posts:create': true,
    'posts:read': true,
    'posts:update': true,
    'posts:delete': true,
    'users:manage': true
  },
  Editor: {
    'posts:create': true,
    'posts:read': true,
    'posts:update': true, // note: update only own content enforced at handler level
    'posts:delete': false
  },
  Viewer: {
    'posts:create': false,
    'posts:read': true,
    'posts:update': false,
    'posts:delete': false
  }
}
