import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function AllFreeGames() {
  return (
    <Layout>
      <Head>
        <title>Tüm Ücretsiz Oyunlar | EpicAPI</title>
        <meta name="description" content="Epic Games Store ve Steam'deki tüm ücretsiz oyunları keşfedin." />
      </Head>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tüm Ücretsiz Oyunlar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Epic Games ve Steam'deki ücretsiz oyunları keşfedin. Kalıcı ücretsiz, geçici ücretsiz ve yakında ücretsiz olacak oyunları görüntüleyin.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bu Sayfa Yapım Aşamasında</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bu özellik şu anda hazırlanıyor. Çok yakında burada tüm ücretsiz oyunları filtreleyip arayabileceksiniz.
          </p>
          <Link href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </Layout>
  );
} 