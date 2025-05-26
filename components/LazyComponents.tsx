import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy loading dos componentes principais
export const LazyCategorySelectionScreen = lazy(() => import('./CategorySelectionScreen'));
export const LazyConfigurationScreen = lazy(() => import('./ConfigurationScreen'));
export const LazyGameScreen = lazy(() => import('./GameScreen'));
export const LazyScoreScreen = lazy(() => import('./ScoreScreen'));
export const LazyStatisticsScreen = lazy(() => import('./StatisticsScreen'));
export const LazyDatabasePopulator = lazy(() => import('./DatabasePopulator'));

// HOC para adicionar Suspense automaticamente
interface WithSuspenseProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const WithSuspense: React.FC<WithSuspenseProps> = ({ 
  fallback = <ComponentLoadingFallback />, 
  children 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Componente de fallback personalizado para loading de componentes
const ComponentLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-slate-100 p-4">
    <LoadingSpinner />
    <p className="mt-4 text-lg font-medium animate-pulse">Carregando componente...</p>
  </div>
);

// Componentes lazy com Suspense já configurado
export const CategorySelectionScreen: React.FC<any> = (props) => (
  <WithSuspense>
    <LazyCategorySelectionScreen {...props} />
  </WithSuspense>
);

export const ConfigurationScreen: React.FC<any> = (props) => (
  <WithSuspense>
    <LazyConfigurationScreen {...props} />
  </WithSuspense>
);

export const GameScreen: React.FC<any> = (props) => (
  <WithSuspense>
    <LazyGameScreen {...props} />
  </WithSuspense>
);

export const ScoreScreen: React.FC<any> = (props) => (
  <WithSuspense>
    <LazyScoreScreen {...props} />
  </WithSuspense>
);

export const StatisticsScreen: React.FC<any> = (props) => (
  <WithSuspense>
    <LazyStatisticsScreen {...props} />
  </WithSuspense>
);

export const DatabasePopulator: React.FC<any> = (props) => (
  <WithSuspense>
    <LazyDatabasePopulator {...props} />
  </WithSuspense>
);

// Hook para preload de componentes
export const useComponentPreloader = () => {
  const preloadComponent = (componentName: string) => {
    switch (componentName) {
      case 'CategorySelection':
        return import('./CategorySelectionScreen');
      case 'Configuration':
        return import('./ConfigurationScreen');
      case 'Game':
        return import('./GameScreen');
      case 'Score':
        return import('./ScoreScreen');
      case 'Statistics':
        return import('./StatisticsScreen');
      case 'DatabasePopulator':
        return import('./DatabasePopulator');
      default:
        console.warn(`Unknown component: ${componentName}`);
        return Promise.resolve();
    }
  };

  const preloadAllComponents = () => {
    const components = ['CategorySelection', 'Configuration', 'Game', 'Score', 'Statistics'];
    return Promise.all(components.map(preloadComponent));
  };

  return {
    preloadComponent,
    preloadAllComponents,
  };
};

// Utilitário para preload inteligente baseado em rota
export const SmartPreloader: React.FC<{ currentScreen: string }> = ({ currentScreen }) => {
  const { preloadComponent } = useComponentPreloader();

  React.useEffect(() => {
    // Preload baseado no screen atual
    switch (currentScreen) {
      case 'CategorySelection':
        // Preload Configuration e Game que são os próximos mais prováveis
        preloadComponent('Configuration');
        preloadComponent('Game');
        break;
      case 'Configuration':
        // Preload Game que é o próximo
        preloadComponent('Game');
        break;
      case 'Playing':
        // Preload Score que é o próximo
        preloadComponent('Score');
        break;
      case 'Score':
        // Preload CategorySelection para novo jogo
        preloadComponent('CategorySelection');
        break;
    }
  }, [currentScreen, preloadComponent]);

  return null; // Componente invisível
};

export default WithSuspense;
