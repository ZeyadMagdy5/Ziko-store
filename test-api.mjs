import { fetchUserProducts, fetchUserCollections } from './src/lib/api.js';

async function runTest() {
    try {
        console.log("Fetching collections...");
        const colData = await fetchUserCollections({ PageSize: 10 });
        const collections = colData.items || colData.data || [];
        console.log(`Found ${collections.length} collections.`);
        
        if (collections.length === 0) {
            console.log("No collections found.");
            return;
        }

        const firstColId = collections[0].id;
        console.log(`Testing CollectionId: ${firstColId}`);

        const filtered = await fetchUserProducts({ PageSize: 100, CollectionId: firstColId });
        const filteredItems = filtered.items || filtered.data || [];
        console.log(`Filtered IDs (${filteredItems.length}):`, filteredItems.map(p => p.id));

        console.log("Fetching ALL (no CollectionId)...");
        const all = await fetchUserProducts({ PageSize: 100 });
        const allItems = all.items || all.data || [];
        console.log(`All IDs (${allItems.length}):`, allItems.map(p => p.id));

        const intersection = allItems.filter(p => filteredItems.some(f => f.id === p.id));
        console.log(`Intersection count: ${intersection.length}`);


    } catch (e) {
        console.error("Test Error:", e);
    }
}

runTest();
