import { NextResponse } from 'next/server';
<<<<<<< HEAD
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'config', 'db-routes.json');

// Helper to ensure config dir exists
function ensureConfigDir() {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
=======
import { getSession } from '@/lib/auth/actions';
import { getUserDatabaseConfig, saveUserDatabaseConfig } from '@/lib/server-db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getUserDatabaseConfig(session.userId);

    if (!config) {
>>>>>>> 3e6d6dc777d1b0acedc765b9e0880151889e9b2d
      // Return default empty config if not found
      return NextResponse.json({
        databases: {
          default: { uri: "", dbName: "postpipe" }
        },
        rules: [],
        defaultTarget: "default"
      });
    }
<<<<<<< HEAD
    const fileContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(fileContent);
    return NextResponse.json(config);
  } catch (error) {
=======

    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to read config:', error);
>>>>>>> 3e6d6dc777d1b0acedc765b9e0880151889e9b2d
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
<<<<<<< HEAD
    const body = await req.json();
    ensureConfigDir();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
=======
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await saveUserDatabaseConfig(session.userId, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save config:', error);
>>>>>>> 3e6d6dc777d1b0acedc765b9e0880151889e9b2d
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
