import BlockInputs from '@components/OTP/BlockInputs';
import { signinDialogActions } from '@stores/defineStore';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function SigninDialog() {
  const {
    login,
    register,
    verifyPhone,
    resendVerificationCode,
    isLoading,
    user,
  } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [phone_number, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  // Soumettre le code OTP pour vérification
  const handleSubmitOTP = async (otp: string[]) => {
    const code = otp.join('');
    const result = await verifyPhone(code);

    if (result.success) {
      setSuccess('Téléphone vérifié avec succès !');
      setIsVerifyingPhone(false);
      signinDialogActions.toggle();
    } else {
      setError(result.error || 'Code de vérification incorrect');
    }
  };

  // Basculer entre les modes d'inscription et de connexion
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
  };

  // Renvoyer le code de vérification
  const handleResendCode = async () => {
    const result = await resendVerificationCode();

    if (result.success) {
      setSuccess('Code renvoyé avec succès !');
    } else {
      setError(result.error || 'Erreur lors du renvoi du code');
    }
  };

  // Gérer l'inscription
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const result = await register({
      name: username,
      email: email || undefined,
      phone_number,
      password,
    });

    if (result.success) {
      setSuccess('Inscription réussie !');
      // Check if phone verification is needed
      if (user && !user.phone_verified) {
        setIsVerifyingPhone(true);
      } else {
        signinDialogActions.toggle();
      }
    } else {
      setError(result.error || "Erreur lors de l'inscription");
    }
  };

  // Gérer la connexion
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email && !phone_number) {
      setError('Veuillez saisir un email ou un numéro de téléphone');
      return;
    }

    const credentials = email
      ? { email, password }
      : { phone_number, password };

    const result = await login(credentials);

    if (result.success) {
      setSuccess('Connexion réussie !');
      // Check if phone verification is needed
      if (user && !user.phone_verified) {
        setIsVerifyingPhone(true);
      } else {
        signinDialogActions.toggle();
      }
    } else {
      setError(result.error || 'Erreur lors de la connexion');
    }
  };

  // Vérifier si le code OTP entré est correct
  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    // The OTP submission is handled by BlockInputs component
  };

  // Encodage du téléphone pour affichage masqué
  const encodePhone = (phone: string): string => {
    if (phone.length < 4) return phone;
    return `${phone.slice(0, 3)}***${phone.slice(-2)}`;
  };

  const EncodedPhone: React.FC<{ phone: string }> = ({ phone }) => (
    <span className='font-semibold text-orange-500'>{encodePhone(phone)}</span>
  );

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'
      onClick={() => signinDialogActions.toggle()}
    >
      <div
        className='bg-white/90 w-full max-w-md mx-4 rounded-xl p-8 shadow-lg relative'
        onClick={e => e.stopPropagation()}
      >
        <button
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
          onClick={() => signinDialogActions.toggle()}
        >
          ✖
        </button>

        {/* Error/Success Messages */}
        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
            {error}
          </div>
        )}
        {success && (
          <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm'>
            {success}
          </div>
        )}

        {isVerifyingPhone ? (
          <>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                Vérification du téléphone
              </h2>
              <p className='text-sm text-gray-600'>
                Un code de vérification a été envoyé au{' '}
                <EncodedPhone phone={user?.phone_number || phone_number} />
              </p>
            </div>
            <form onSubmit={handleVerifyCode} className='space-y-6'>
              <BlockInputs randomCode='' handleSubmit={handleSubmitOTP} />
              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors'
              >
                {isLoading ? 'Vérification...' : 'Vérifier'}
              </button>
              <div className='text-center'>
                <span className='text-sm text-gray-600'>
                  Vous n'avez pas reçu le code ?{' '}
                  <button
                    type='button'
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className='text-orange-500 hover:text-orange-600 font-medium disabled:text-gray-400'
                  >
                    Renvoyer
                  </button>
                </span>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                {isRegistering ? "S'inscrire" : 'Se connecter'}
              </h2>
              <p className='text-sm text-gray-600'>
                {isRegistering ? (
                  <>
                    Vous avez déjà un compte ?{' '}
                    <button
                      className='text-orange-500 hover:text-orange-600 font-medium'
                      onClick={toggleForm}
                    >
                      Se connecter
                    </button>
                  </>
                ) : (
                  <>
                    Pas encore de compte ?{' '}
                    <button
                      className='text-orange-500 hover:text-orange-600 font-medium'
                      onClick={toggleForm}
                    >
                      S'inscrire
                    </button>
                  </>
                )}
              </p>
            </div>

            <form
              onSubmit={isRegistering ? handleRegister : handleLogin}
              className='space-y-4'
            >
              {isRegistering && (
                <div className='relative'>
                  <label className='text-sm font-medium text-gray-700 mb-1 block'>
                    Nom d'utilisateur
                  </label>
                  <input
                    type='text'
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                    placeholder="Nom d'utilisateur"
                  />
                </div>
              )}

              <div className='relative'>
                <label className='text-sm font-medium text-gray-700 mb-1 block'>
                  Email {!isRegistering && '(optionnel)'}
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                  placeholder='john.doe@example.com'
                />
              </div>

              <div className='relative'>
                <label className='text-sm font-medium text-gray-700 mb-1 block'>
                  Téléphone {isRegistering ? '*' : "(si pas d'email)"}
                </label>
                <input
                  type='tel'
                  value={phone_number}
                  onChange={e => setPhone(e.target.value)}
                  required={isRegistering || !email}
                  className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                  placeholder='+33 6 12 34 56 78'
                />
              </div>

              <div className='relative'>
                <label className='text-sm font-medium text-gray-700 mb-1 block'>
                  Mot de passe
                </label>
                <input
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                  placeholder='••••••••'
                />
              </div>

              {isRegistering && (
                <div className='relative'>
                  <label className='text-sm font-medium text-gray-700 mb-1 block'>
                    Confirmation du mot de passe
                  </label>
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className='w-full p-2.5 rounded-lg bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-200 outline-none text-gray-700 text-sm'
                    placeholder='••••••••'
                  />
                  <div className='absolute right-3 top-9'>
                    {confirmPassword &&
                      (passwordsMatch ? (
                        <FaCheckCircle className='text-green-500' />
                      ) : (
                        <FaTimesCircle className='text-red-500' />
                      ))}
                  </div>
                </div>
              )}

              {!isRegistering && (
                <div className='flex items-center justify-between'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className='w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-200'
                    />
                    <span className='ml-2 text-sm text-gray-600'>
                      Se souvenir de moi
                    </span>
                  </label>
                  <a
                    href='#'
                    className='text-sm text-orange-500 hover:text-orange-600 font-medium'
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
              )}

              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 rounded-lg text-white text-sm font-medium transition-colors mt-6'
              >
                {isLoading
                  ? isRegistering
                    ? 'Création...'
                    : 'Connexion...'
                  : isRegistering
                    ? 'Créer mon compte'
                    : 'Se connecter'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
