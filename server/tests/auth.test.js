const authService = require('../services/authService');
const database = require('../database/connection');

describe('AuthService', () => {
    beforeEach(async () => {
        // Clean up database before each test
        await testUtils.cleanupTestData(database);
    });

    afterAll(async () => {
        await database.close();
    });

    describe('User Registration', () => {
        test('should register a new user successfully', async () => {
            const userData = testUtils.generateTestUser();

            const result = await authService.register(userData);

            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
            expect(result.user.username).toBe(userData.username);
            expect(result.user.email).toBe(userData.email);
            expect(result.user.password_hash).toBeUndefined(); // Should not return password
            expect(result.token).toBeDefined();
        });

        test('should fail registration with duplicate username', async () => {
            const userData = testUtils.generateTestUser();

            // Register first user
            await authService.register(userData);

            // Try to register with same username
            const result = await authService.register(userData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('username already exists');
        });

        test('should fail registration with duplicate email', async () => {
            const userData = testUtils.generateTestUser();

            // Register first user
            await authService.register(userData);

            // Try to register with same email but different username
            const duplicateUser = {
                ...userData,
                username: 'different_username'
            };

            const result = await authService.register(duplicateUser);

            expect(result.success).toBe(false);
            expect(result.error).toContain('email already exists');
        });

        test('should fail registration with invalid data', async () => {
            const invalidUserData = {
                username: 'a', // Too short
                email: 'invalid-email',
                password: '123' // Too short
            };

            const result = await authService.register(invalidUserData);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('User Login', () => {
        test('should login with correct credentials', async () => {
            const userData = testUtils.generateTestUser();
            await authService.register(userData);

            const loginResult = await authService.login({
                username: userData.username,
                password: userData.password
            });

            expect(loginResult.success).toBe(true);
            expect(loginResult.user).toBeDefined();
            expect(loginResult.token).toBeDefined();
            expect(loginResult.user.username).toBe(userData.username);
        });

        test('should fail login with incorrect password', async () => {
            const userData = testUtils.generateTestUser();
            await authService.register(userData);

            const loginResult = await authService.login({
                username: userData.username,
                password: 'wrongpassword'
            });

            expect(loginResult.success).toBe(false);
            expect(loginResult.error).toContain('Invalid credentials');
        });

        test('should fail login with non-existent username', async () => {
            const loginResult = await authService.login({
                username: 'nonexistent',
                password: 'password123'
            });

            expect(loginResult.success).toBe(false);
            expect(loginResult.error).toContain('Invalid credentials');
        });
    });

    describe('Token Verification', () => {
        test('should verify valid token', async () => {
            const userData = testUtils.generateTestUser();
            const registerResult = await authService.register(userData);

            const verifyResult = await authService.verifyToken(registerResult.token);

            expect(verifyResult.success).toBe(true);
            expect(verifyResult.user).toBeDefined();
            expect(verifyResult.user.username).toBe(userData.username);
        });

        test('should fail with invalid token', async () => {
            const verifyResult = await authService.verifyToken('invalid-token');

            expect(verifyResult.success).toBe(false);
            expect(verifyResult.error).toBeDefined();
        });

        test('should fail with expired token', async () => {
            // Create a token with very short expiry
            const originalExpiry = process.env.JWT_EXPIRES_IN;
            process.env.JWT_EXPIRES_IN = '1ms';

            const userData = testUtils.generateTestUser();
            const registerResult = await authService.register(userData);

            // Wait for token to expire
            await testUtils.wait(10);

            const verifyResult = await authService.verifyToken(registerResult.token);

            expect(verifyResult.success).toBe(false);
            expect(verifyResult.error).toContain('expired');

            // Restore original expiry
            process.env.JWT_EXPIRES_IN = originalExpiry;
        });
    });

    describe('User Profile Management', () => {
        test('should get user profile by ID', async () => {
            const userData = testUtils.generateTestUser();
            const registerResult = await authService.register(userData);

            const profileResult = await authService.getUserById(registerResult.user.id);

            expect(profileResult).toBeDefined();
            expect(profileResult.username).toBe(userData.username);
            expect(profileResult.email).toBe(userData.email);
        });

        test('should update user profile', async () => {
            const userData = testUtils.generateTestUser();
            const registerResult = await authService.register(userData);

            const updateData = {
                bio: 'Updated bio',
                country: 'Test Country'
            };

            const updateResult = await authService.updateProfile(registerResult.user.id, updateData);

            expect(updateResult.success).toBe(true);
            expect(updateResult.user.bio).toBe(updateData.bio);
            expect(updateResult.user.country).toBe(updateData.country);
        });

        test('should change password successfully', async () => {
            const userData = testUtils.generateTestUser();
            const registerResult = await authService.register(userData);

            const changeResult = await authService.changePassword(
                registerResult.user.id,
                userData.password,
                'newpassword123'
            );

            expect(changeResult.success).toBe(true);

            // Verify new password works
            const loginResult = await authService.login({
                username: userData.username,
                password: 'newpassword123'
            });

            expect(loginResult.success).toBe(true);
        });

        test('should fail password change with incorrect current password', async () => {
            const userData = testUtils.generateTestUser();
            const registerResult = await authService.register(userData);

            const changeResult = await authService.changePassword(
                registerResult.user.id,
                'wrongpassword',
                'newpassword123'
            );

            expect(changeResult.success).toBe(false);
            expect(changeResult.error).toContain('Current password is incorrect');
        });
    });

    describe('Session Management', () => {
        test('should logout user and invalidate session', async () => {
            const userData = testUtils.generateTestUser();
            const registerResult = await authService.register(userData);

            const logoutResult = await authService.logout(registerResult.token);

            expect(logoutResult.success).toBe(true);

            // Verify token is no longer valid
            const verifyResult = await authService.verifyToken(registerResult.token);
            expect(verifyResult.success).toBe(false);
        });

        test('should refresh token successfully', async () => {
            const userData = testUtils.generateTestUser();
            const registerResult = await authService.register(userData);

            // Get refresh token from the user session
            const user = await authService.getUserById(registerResult.user.id);
            const sessions = await database.all(
                'SELECT refresh_token FROM user_sessions WHERE user_id = ?',
                [user.id]
            );

            if (sessions.length > 0) {
                const refreshResult = await authService.refreshToken(sessions[0].refresh_token);

                expect(refreshResult.success).toBe(true);
                expect(refreshResult.token).toBeDefined();
                expect(refreshResult.token).not.toBe(registerResult.token);
            }
        });
    });

    describe('Password Hashing', () => {
        test('should hash password correctly', async () => {
            const password = 'testpassword123';
            const hash = await authService.hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are long
        });

        test('should compare password correctly', async () => {
            const password = 'testpassword123';
            const hash = await authService.hashPassword(password);

            const isMatch = await authService.comparePassword(password, hash);
            expect(isMatch).toBe(true);

            const isNotMatch = await authService.comparePassword('wrongpassword', hash);
            expect(isNotMatch).toBe(false);
        });
    });
});
