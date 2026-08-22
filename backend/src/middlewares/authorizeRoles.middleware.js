export function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This route is only for ${allowedRoles.join(
                    ", "
                )} users.`,
            });
        }
        next();
    };
}