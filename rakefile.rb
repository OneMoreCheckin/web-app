# # #
# Roxee Api
# # #

TOP_LEVEL_DIR = File.dirname(__FILE__)
if File.exists?(File.join(TOP_LEVEL_DIR, '..', 'common-tools'))
  parent_path = '..'
else
  parent_path = '../..'
end
require File.join(TOP_LEVEL_DIR, parent_path, 'common-tools', 'lib', 'deploy.rb')

#desc("Invoke 'deploy' task")
#task :default => :deploy

namespace :api do

  @list = FileList.new("src/**/**", "")
  @deploy =  Deploy::path("")
  
  desc("Deploy winfail server")
  
  task :deploy do
    print " ####=========> Deploying stuff ###"
    Deploy::remove_if_exist(@deploy)
    Deploy::recursive_copy(@list, @deploy)
    sh "cp -R " + @deploy + "src/* "+ @deploy
    sh "rm -rf " + @deploy + "src/"

  end
    
  task :undeploy do
    Deploy::remove_if_exist(@deploy)
  end
    

end


