import { strict as assert } from 'node:assert';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const AKRONO_BASE_URL = process.env.AKRONO_BASE_URL || 'http://localhost:3997';
const AKRONO_API_KEY = process.env.AKRONO_API_KEY || 'test-key-123';

let client;
let transport;
let checksPass = 0;
let hasError = false;

async function runTests() {
  try {
    // 1. Crear cliente y transporte
    console.log('Iniciando cliente MCP...');
    client = new Client({ name: 'test-client', version: '1.0.0' });

    transport = new StdioClientTransport({
      command: 'node',
      args: ['server.mjs'],
      env: {
        AKRONO_BASE_URL,
        AKRONO_API_KEY,
      },
      cwd: import.meta.url.replace('file://', '').replace('/test-mcp.mjs', ''),
      stderr: 'pipe',
    });

    await client.connect(transport);
    console.log('✓ Cliente conectado al servidor MCP');

    // 2. Verificar listTools devuelve 11 tools esperadas
    console.log('Listando tools disponibles...');
    const toolsResult = await client.listTools();
    const toolNames = toolsResult.tools.map(t => t.name);
    const expectedTools = [
      'listar_tiendas',
      'crear_tienda',
      'obtener_tienda',
      'actualizar_tienda',
      'listar_productos',
      'subir_producto',
      'eliminar_producto',
      'subir_categoria',
      'listar_pedidos',
      'actualizar_pedido',
      'estadisticas',
    ];

    assert.strictEqual(toolsResult.tools.length, 11, `Se esperaban 11 tools, se obtuvieron ${toolsResult.tools.length}`);
    for (const expectedTool of expectedTools) {
      assert.ok(toolNames.includes(expectedTool), `Tool faltante: ${expectedTool}`);
    }
    checksPass++;
    console.log(`✓ Check 1: ${toolsResult.tools.length} tools encontradas (todas esperadas)`);

    // 3. Llamar listar_tiendas y verificar que incluye "akrono"
    console.log('Obteniendo lista de tiendas...');
    const listStoresResult = await client.callTool({ name: 'listar_tiendas', arguments: {} });
    assert.ok(listStoresResult.content && listStoresResult.content.length > 0, 'listar_tiendas devolvió respuesta vacía');
    const storesText = listStoresResult.content[0].text || '';

    // Intentar parsear como JSON, pero tolerante si no es posible
    let storesData;
    try {
      storesData = JSON.parse(storesText);
    } catch {
      assert.ok(storesText.includes('akrono'), 'No se encontró "akrono" en la respuesta de tiendas');
      storesData = null;
    }

    if (storesData && Array.isArray(storesData)) {
      assert.ok(storesData.some(s => s.slug === 'akrono' || s.name === 'akrono' || s.id === 'akrono'),
        'akrono no encontrado en la lista de tiendas');
    } else if (storesData && !Array.isArray(storesData) && typeof storesData === 'object' && storesData.stores) {
      assert.ok(storesData.stores.some(s => s.slug === 'akrono' || s.name === 'akrono'),
        'akrono no encontrado en la lista de tiendas');
    }

    checksPass++;
    console.log('✓ Check 2: listar_tiendas incluye "akrono"');

    // 4. Crear tienda de prueba
    console.log('Creando tienda de prueba...');
    const createStoreResult = await client.callTool({
      name: 'crear_tienda',
      arguments: {
        slug: 'mcp-test-shop',
        name: 'MCP Test Shop',
      },
    });
    assert.ok(createStoreResult.content && createStoreResult.content.length > 0, 'crear_tienda devolvió respuesta vacía');
    const createStoreText = createStoreResult.content[0].text || '';
    assert.ok(!createStoreResult.isError, `crear_tienda retornó error: ${createStoreText}`);
    assert.ok(
      createStoreText.includes('mcp-test-shop') || createStoreText.includes('MCP Test Shop'),
      'Respuesta de crear_tienda no contiene los datos esperados'
    );
    checksPass++;
    console.log('✓ Check 3: crear_tienda con {slug:"mcp-test-shop", name:"MCP Test Shop"} exitoso');

    // 5. Subir producto
    console.log('Subiendo producto de prueba...');
    const uploadProductResult = await client.callTool({
      name: 'subir_producto',
      arguments: {
        store: 'mcp-test-shop',
        producto: {
          slug: 'mcp-p1',
          name_es: 'MCP Prod',
          name_en: 'MCP Prod',
          category: 'cat',
          price_cop: 10000,
          price_usd: 3,
          stock: 5,
        },
      },
    });
    assert.ok(uploadProductResult.content && uploadProductResult.content.length > 0, 'subir_producto devolvió respuesta vacía');
    const uploadProductText = uploadProductResult.content[0].text || '';
    assert.ok(!uploadProductResult.isError, `subir_producto retornó error: ${uploadProductText}`);
    assert.ok(
      uploadProductText.includes('mcp-p1') || uploadProductText.includes('MCP Prod'),
      'Respuesta de subir_producto no contiene los datos esperados'
    );
    checksPass++;
    console.log('✓ Check 4: subir_producto exitoso');

    // 6. Listar productos y verificar que contiene "mcp-p1"
    console.log('Listando productos...');
    const listProductsResult = await client.callTool({
      name: 'listar_productos',
      arguments: { store: 'mcp-test-shop' },
    });
    assert.ok(listProductsResult.content && listProductsResult.content.length > 0, 'listar_productos devolvió respuesta vacía');
    const listProductsText = listProductsResult.content[0].text || '';

    let productsData;
    try {
      productsData = JSON.parse(listProductsText);
    } catch {
      assert.ok(listProductsText.includes('mcp-p1'), 'No se encontró "mcp-p1" en la respuesta de productos');
      productsData = null;
    }

    if (productsData && Array.isArray(productsData)) {
      assert.ok(productsData.some(p => p.slug === 'mcp-p1' || p.name_es === 'MCP Prod'),
        'mcp-p1 no encontrado en la lista de productos');
    } else if (productsData && !Array.isArray(productsData) && typeof productsData === 'object' && productsData.products) {
      assert.ok(productsData.products.some(p => p.slug === 'mcp-p1'),
        'mcp-p1 no encontrado en la lista de productos');
    }

    checksPass++;
    console.log('✓ Check 5: listar_productos contiene "mcp-p1"');

    // 7. Obtener estadísticas
    console.log('Obteniendo estadísticas...');
    const statsResult = await client.callTool({
      name: 'estadisticas',
      arguments: { store: 'mcp-test-shop' },
    });
    assert.ok(statsResult.content && statsResult.content.length > 0, 'estadisticas devolvió respuesta vacía');
    const statsText = statsResult.content[0].text || '';
    assert.ok(!statsResult.isError, `estadisticas retornó error: ${statsText}`);
    checksPass++;
    console.log('✓ Check 6: estadisticas responde correctamente');

    // Éxito
    console.log(`\n✅ ${checksPass} checks MCP OK`);
    process.exit(0);
  } catch (error) {
    hasError = true;
    console.error('\n❌ Test falló:', error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Cerrar cliente y transporte
    if (client) {
      try {
        await client.close();
      } catch (e) {
        // Ignorar errores al cerrar
      }
    }
  }
}

// Ejecutar tests
runTests().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
