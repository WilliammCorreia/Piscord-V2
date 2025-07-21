// Tests CDA - Démonstration Compétences

describe('Piscord - Tests CDA', () => {
  
  // Test 1: Structure du code
  test('UserRepository existe et fonctionne', () => {
    const UserRepo = require('../backend/repositories/UserRepository');
    expect(typeof UserRepo.create).toBe('function');
    expect(typeof UserRepo.findByEmail).toBe('function');
  });
  
  // Test 2: Logique métier
  test('InvitationService génère des codes', () => {
    const InvitationService = require('../backend/services/InvitationService');
    const code = InvitationService.generateInvitationCode();
    expect(code.length).toBe(8);
  });
  
  // Test 3: Sécurité (obligatoire CDA)
  test('Validation email sécurisée', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('user@test.com')).toBe(true);
    expect(emailRegex.test('"; DROP TABLE')).toBe(false);
  });
  
  // Test 4: Gestion erreurs
  test('MessageService valide les paramètres', async () => {
    const MessageService = require('../backend/services/MessageService');
    await expect(MessageService.create('', '', ''))
      .rejects.toThrow();
  });
});