```js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

await supabase.from('tips').insert({ sender, recipient, amount, txHash });
```