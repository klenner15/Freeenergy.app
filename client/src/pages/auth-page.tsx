import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Redirect } from 'wouter';
import { insertUserSchema, UserRole } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import Logo from '@/components/ui/logo';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Extended login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Extended register schema with validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: "CONSUMER",
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    // Remove confirmPassword as it's not in the schema
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // If user is already logged in, redirect to appropriate page
  console.log("Auth page - checking user:", user);
  if (user) {
    console.log("User is logged in, role:", user.role);
    if (!user.role) {
      console.log("No role, redirecting to role selection");
      return <Redirect to="/role-selection" />;
    } else if (user.role === "CONSUMER") {
      console.log("Consumer role, redirecting to home");
      return <Redirect to="/" />;
    } else if (user.role === "MERCHANT") {
      console.log("Merchant role, redirecting to merchant dashboard");
      return <Redirect to="/merchant/dashboard" />;
    } else if (user.role === "DELIVERY") {
      console.log("Delivery role, redirecting to delivery dashboard");
      return <Redirect to="/delivery/dashboard" />;
    } else {
      console.log("Unknown role:", user.role);
    }
  } else {
    console.log("No user, showing auth page");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-center">Bem-vindo ao Já Comprei</h1>
          <p className="text-neutral-500 text-center mb-8">Conectando você ao comércio local</p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email ou Usuário</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seu@email.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Sua senha" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Lembrar-me</FormLabel>
                        </FormItem>
                      )}
                    />
                    <a href="#" className="text-sm font-medium text-secondary">
                      Esqueceu a senha?
                    </a>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </Form>
              
              <div className="relative flex items-center justify-center mt-6">
                <div className="border-t border-neutral-200 absolute w-full"></div>
                <div className="bg-gray-50 text-neutral-500 text-sm px-4 relative">
                  ou continue com
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button variant="outline" className="flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.818h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#FFC107"/>
                    <path d="M12.545,10.239v3.818h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2" fill="#FF3D00"/>
                    <path d="M12.545,10.239v3.818h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814" fill="#4CAF50"/>
                    <path d="M12.545,10.239v3.818h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453" fill="#1976D2"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="flex items-center justify-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.163 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.917.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" fill="#333"/>
                  </svg>
                  GitHub
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Seu nome completo" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="seu@email.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Usuário</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seunome" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Crie uma senha" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirme a Senha</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Repita sua senha" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 mt-2"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          
          <p className="text-center text-sm text-neutral-500 mt-6">
            {activeTab === 'login' ? (
              <>
                Não tem uma conta? <button onClick={() => setActiveTab('register')} className="font-medium text-secondary">Cadastre-se</button>
              </>
            ) : (
              <>
                Já tem uma conta? <button onClick={() => setActiveTab('login')} className="font-medium text-secondary">Faça login</button>
              </>
            )}
          </p>
        </div>
      </div>
      
      {/* Right side - Hero image and text (visible only on desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-primary text-white p-8 flex-col justify-center items-center">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">Transforme seu bairro num shopping virtual</h2>
          <p className="text-lg mb-6">
            Conecte-se ao comércio local, compre produtos frescos e receba rapidamente. 
            Um verdadeiro iFood de tudo para a sua cidade!
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Entregas rápidas para sua comodidade</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Apoie negócios locais da sua comunidade</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Uma plataforma segura e conveniente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
