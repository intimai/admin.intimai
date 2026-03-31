import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { ThemeToggle } from './ThemeToggle';

export function Layout({ children }) {
    const { user, signOut, loading } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    console.log('Attempting to sign out for user:', user);
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('Successfully signed out');
        navigate('/login');
      }
    } catch (error) {
      console.error('Caught an exception during sign out:', error);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground relative">
      {/* Overlay para mobile quando a sidebar estiver aberta */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-card/60 border-b border-border p-4 flex justify-between items-center sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center">
            {/* Botão de Menu Mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2" 
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
            {/* Espaço reservado à esquerda para futuros elementos */}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
                <div className="flex items-center space-x-3 hidden sm:flex">
                    <span className="text-sm font-semibold text-foreground truncate">{user.nome}</span>
                </div>
            )}
            <ThemeToggle />
            <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground" disabled={loading}>
              <LogOut className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </main>
        <footer className="text-center p-4 text-xs text-muted-foreground">
          powered by Aurios AI
        </footer>
      </div>
    </div>
  );
}