import { supabaseAdmin } from '../supabase.js';

const TOOLS = [
  {
    name: 'get_tournaments',
    description: 'List HERU tournaments. Can filter by status (draft/published/live/completed), game, or search by name.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['draft', 'published', 'live', 'completed'] },
        game: { type: 'string' },
        limit: { type: 'number' },
      },
    },
    handler: async (args) => {
      let query = supabaseAdmin.from('tournaments').select('id,name,game,status,format,max_teams,schedule,total_cost,prizepool_total,on_radar').order('created_at', { ascending: false }).limit(args.limit || 10);
      if (args.status) query = query.eq('status', args.status);
      if (args.game) query = query.ilike('game', `%${args.game}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_tournament_detail',
    description: 'Get full details of a specific tournament by ID.',
    input_schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    handler: async (args) => {
      const { data, error } = await supabaseAdmin.from('tournaments').select('*').eq('id', args.id).single();
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_gamer_profile',
    description: 'Get a gamer profile by user_id or username.',
    input_schema: { type: 'object', properties: { user_id: { type: 'string' }, username: { type: 'string' } } },
    handler: async (args) => {
      let query = supabaseAdmin.from('gamer_profiles').select('id,username,bio,games,is_talent,talent_type,talent_price,talent_rating,team_ids,created_at');
      if (args.user_id) query = query.eq('user_id', args.user_id);
      else if (args.username) query = query.ilike('username', args.username);
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_my_riot_accounts',
    description: "Get the current user's linked Riot accounts (LoL and Valorant stats).",
    input_schema: { type: 'object', properties: {} },
    handler: async (args, ctx) => {
      const { data, error } = await supabaseAdmin.from('riot_accounts').select('*').eq('user_id', ctx.userId).order('created_at');
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_teams',
    description: 'List or search HERU teams.',
    input_schema: { type: 'object', properties: { name: { type: 'string' }, game: { type: 'string' }, limit: { type: 'number' } } },
    handler: async (args) => {
      let query = supabaseAdmin.from('teams').select('id,name,logo,games,is_recruiting,description').limit(args.limit || 10);
      if (args.name) query = query.ilike('name', `%${args.name}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_team_detail',
    description: 'Get full details of a team by ID.',
    input_schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    handler: async (args) => {
      const { data, error } = await supabaseAdmin.from('teams').select('*').eq('id', args.id).single();
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_radar_listings',
    description: 'List open Sponsorship Radar listings (tournaments seeking co-organizers).',
    input_schema: { type: 'object', properties: { status: { type: 'string', enum: ['open', 'in_progress', 'fully_funded'] }, limit: { type: 'number' } } },
    handler: async (args) => {
      let query = supabaseAdmin.from('sponsorship_radar').select('id,tournament_name,game,schedule,total_cost,funding_percent,amount_still_needed,status').order('created_at', { ascending: false }).limit(args.limit || 10);
      if (args.status) query = query.eq('status', args.status);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_my_orders',
    description: "Get the current user's marketplace orders.",
    input_schema: { type: 'object', properties: {} },
    handler: async (args, ctx) => {
      const { data, error } = await supabaseAdmin.from('orders').select('id,order_type,tournament_name,items,total,status,created_at').eq('gamer_id', ctx.userId).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_my_bills',
    description: "Get the current organizer's bills. Only works for organizer role.",
    input_schema: { type: 'object', properties: {} },
    handler: async (args, ctx) => {
      if (ctx.userRole !== 'organizer') return { error: 'Only available to organizers' };
      const { data, error } = await supabaseAdmin.from('bills').select('id,bill_number,bill_type,tournament_name,grand_total,payment_status,due_date').eq('payer_id', ctx.userId).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'get_marketplace_items',
    description: 'Browse marketplace items available for tournament building.',
    input_schema: { type: 'object', properties: { category: { type: 'string', enum: ['game_setup', 'teams', 'live_talent', 'production', 'branding', 'venue', 'prizepool'] }, limit: { type: 'number' } } },
    handler: async (args) => {
      let query = supabaseAdmin.from('marketplace_items').select('id,title,description,category,type,price,image').eq('is_active', true).limit(args.limit || 20);
      if (args.category) query = query.eq('category', args.category);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  },
  {
    name: 'update_gamer_profile',
    description: "Update the current gamer's profile. ALWAYS confirm with user before calling.",
    input_schema: { type: 'object', properties: { bio: { type: 'string' }, games: { type: 'array', items: { type: 'string' } }, username: { type: 'string' } } },
    requiresConfirmation: true,
    handler: async (args, ctx) => {
      if (ctx.userRole !== 'gamer') return { error: 'Only gamers can update gamer profile' };
      const { data, error } = await supabaseAdmin.from('gamer_profiles').update({ ...args, updated_at: new Date().toISOString() }).eq('user_id', ctx.userId).select().single();
      if (error) throw error;
      return { success: true, profile: data };
    },
  },
  {
    name: 'create_tournament',
    description: 'Create a new tournament draft. Only for organizers. ALWAYS confirm with user before calling.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        game: { type: 'string' },
        format: { type: 'string' },
        max_teams: { type: 'number' },
        schedule: { type: 'string' },
        description: { type: 'string' },
        prizepool_total: { type: 'number' },
        tournament_type: { type: 'string', enum: ['solo', 'shared'] },
      },
      required: ['name', 'game'],
    },
    requiresConfirmation: true,
    handler: async (args, ctx) => {
      if (ctx.userRole !== 'organizer') return { error: 'Only organizers can create tournaments' };
      const { data: orgProfile } = await supabaseAdmin.from('organizer_profiles').select('id,brand_name').eq('user_id', ctx.userId).single();
      const { data, error } = await supabaseAdmin.from('tournaments').insert({
        ...args,
        organizer_id: ctx.userId,
        main_organizer_id: ctx.userId,
        organizer_brand: orgProfile || {},
        status: 'draft',
        platform_fee_percent: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      return { success: true, tournament: data };
    },
  },
];

export function getToolDefinitions() {
  return TOOLS.map(({ name, description, input_schema }) => ({ name, description, input_schema }));
}

export async function executeTool(name, args, context) {
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.handler(args, context);
}

export function toolRequiresConfirmation(name) {
  return TOOLS.find(t => t.name === name)?.requiresConfirmation || false;
}
