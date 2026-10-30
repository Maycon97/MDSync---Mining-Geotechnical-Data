package com.itaminas.mdsync;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        optimizeWebEngine();
    }

    @Override
    public void onResume() {
        super.onResume();
        optimizeWebEngine();
    }

    /**
     * Motor de Alto Desempenho MDSync Geotecnia:
     * - Aceleração gráfica direta via GPU (Hardware Layer)
     * - Prioridade máxima de renderização
     * - Pré-renderização de elementos fora de tela (Offscreen Pre-raster)
     * - Suporte completo a IndexedDB, Web Storage e Cache persistente
     */
    private void optimizeWebEngine() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        // Força aceleração via hardware na camada gráfica
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        WebSettings settings = webView.getSettings();
        if (settings != null) {
            settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setLoadsImagesAutomatically(true);
            settings.setBlockNetworkImage(false);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                settings.setOffscreenPreRaster(true);
            }
        }
    }
}
