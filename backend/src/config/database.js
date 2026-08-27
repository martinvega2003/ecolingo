import mongoose from 'mongoose';

// Transform global: toda respuesta expone `id` (string) en lugar de `_id`,
// y nunca serializa `passwordHash`. Definido en la §0.1/§0.7 de la guía.
mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

// En desarrollo, imprime cada consulta en la consola.
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta la variable de entorno MONGODB_URI');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    console.log(`✅ MongoDB conectado — base: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.warn('MongoDB desconectado'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconectado'));