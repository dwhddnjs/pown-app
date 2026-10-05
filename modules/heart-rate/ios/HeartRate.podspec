Pod::Spec.new do |s|
  s.name           = 'HeartRate'
  s.version        = '1.0.0'
  s.summary        = 'HealthKit workout session + Live Activity'
  s.description    = 'HealthKit workout session + Live Activity'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.5' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  # ActivityKit은 16.1부터 있다 — 강한 링크면 15.x 기기에서 실행하자마자 죽는다
  s.weak_frameworks = 'ActivityKit'
  # WatchConnectivity를 명시한다 — 자동 링크에만 맡겼을 때 isWatchAppInstalled가 늘 false였다는 보고가 있다
  s.frameworks = 'HealthKit', 'WatchConnectivity'

  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = "**/*.{h,m,mm,swift}"
end
